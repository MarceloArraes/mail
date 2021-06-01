document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-input').addEventListener('click', submit_email);



  // By default, load the inbox
  load_mailbox('inbox');
});

function submit_email() {
  //posting email to server:
  userr = document.querySelector('#userid').innerHTML;
  recipients1 = document.querySelector('#compose-recipients').value;
  subject1 = document.querySelector('#compose-subject').value;
  body1 = document.querySelector('#compose-body').value;


  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      user: userr,
      sender: userr,
      recipients: recipients1,
      subject: subject1,
      body: body1,
      read: false,
      arquived: false,
    })
  })
    .then(response => response.json())
    .then(result => {
      // Print result
      console.log(result);
    });
  return load_mailbox('inbox');
}

function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#read-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}

function reply_email(email) {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#read-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = email.sender;

  if (email.subject.indexOf("Re: ") != -1) {
    console.log("enter REIF")
    document.querySelector('#compose-subject').value = email.subject;
  } else {
    document.querySelector('#compose-subject').value = "Re: " + email.subject;
  }

  document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
}


function load_readmail(children1, email) {
  console.log(children1.id);
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#read-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  document.querySelector('#read-sender').innerHTML = "Sender: " + email.sender;
  document.querySelector('#read-receiver').innerHTML = "Receiver: " + email.recipients;
  document.querySelector('#read-subject').innerHTML = "Subject: " + email.subject;
  document.querySelector('#read-body').innerHTML = "Body: " + email.body;
  document.querySelector('#read-timestamp').innerHTML = "Timestamp: " + email.timestamp;
  document.querySelector('#checkArquive').checked = email.archived;

  document.querySelector('#replybutton').onclick = function () {
    reply_email(email);
  }

  document.querySelector('#checkArquive').onchange = function () {
    if (document.querySelector('#checkArquive').checked == true) {

      fetch('/emails/' + email.id, {
        method: 'PUT',
        body: JSON.stringify({
          archived: true
        })
      })
      alert("Email Archived");
      return load_mailbox('inbox');
    } else if (document.querySelector('#checkArquive').checked == false) {
      fetch('/emails/' + email.id, {
        method: 'PUT',
        body: JSON.stringify({
          archived: false
        })
      })
      alert("Email Unarchived");
      return load_mailbox('inbox');
    }
  }

  fetch('/emails/' + email.id, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })

}

function show_list(email) {
  for (let i in email) {
    mailmain = document.createElement("div");
    mailmain.className = "list-group-item list-group-item-action";
    mailmain.id = `id${i}`;
    mailmain.onclick = function () {
      load_readmail(this, email[i]);
    }

    if (email[i].read == true) {
      mailmain.style.backgroundColor = "lightgrey";
    }

    mailmain.innerHTML = `<br><h5>sender: ${email[i].sender} subject: ${email[i].subject}</h5>`;
    document.querySelector('#emails-third').appendChild(mailmain);


    mailfields = document.createElement("div");
    mailfields.innerHTML = `<h6>${email[i].timestamp}</h6>`;
    mailmain.appendChild(mailfields);
  }
}

function load_mailbox(mailbox) {
  // Show the mailbox name
  document.querySelector('#emails-first').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  // Show the mailbox and hide other views
  document.querySelector('#emails-third').innerHTML = '';
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#read-view').style.display = 'none';


  if (mailbox === 'inbox') {
    //fetching emails from server:
    fetch('/emails/inbox')
      .then(response => response.json())
      .then(email => {
        show_list(email);
      });
  } else if (mailbox === 'sent') {
    //fetching emails from server:
    fetch('/emails/sent')
      .then(response => response.json())
      .then(email => {
        show_list(email);
      });

  } else if (mailbox === 'archive') {
    //fetching emails from server:
    fetch('/emails/archive')
      .then(response => response.json())
      .then(email => {
        show_list(email);
      });
  }
}