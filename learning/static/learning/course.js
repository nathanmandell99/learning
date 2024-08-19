document.addEventListener('DOMContentLoaded', () => {
  // From here we can use API calls to retrieve everything we need to know about the course.
  const descTab = document.querySelector('#description-tab');
  descTab.addEventListener('click', displaySyllabus);

  const annTab = document.querySelector('#announcements-tab');
  annTab.addEventListener('click', displayAnnouncements);

  const assTab = document.querySelector('#assignments-tab');
  assTab.addEventListener('click', displayAssignments);

  const submTab = document.querySelector('#submissions-tab');
  submTab.addEventListener('click', displaySubmissions);

  displaySyllabus();
  eventDelegator();
})

async function eventDelegator() {
  document.addEventListener('click', async (event) => {
    if (event.target.id.includes("ann-id")) {
      // Make call to backend to retrieve the announcement
      let annId = event.target.dataset.annId;
      let response = await fetch(`/course/${courseID}/announcements/${annId}`);
      let announcement = await response.json();
      displayAnnouncement(announcement);
    }
    else if (event.target.id === "back-ann") {
      displayAnnouncements();
    }
    else if (event.target.id.includes("assn-id")) {
      let assnId = event.target.dataset.assnId;
      let response = await fetch(`/course/${courseID}/assignments/${assnId}`);
      let assignment = await response.json();
      console.log(assignment);
      displayAssignment(assignment);
    }
    else if (event.target.id === "back-assn") {
      displayAssignments();
    }
    else if (event.target.id === "sbmit-btn") {
      // Send the file to a backend API.
      // ...but how do we get the file?
    }

  });
}

function displaySyllabus() {
  document.querySelector('.sidebar .active').classList.remove('active');

  document.querySelector('#description-tab').classList.add('active');
  courseView.innerHTML = `<p>${body}</p>`;

}

async function displayAnnouncements() {
  document.querySelector('.sidebar .active').classList.remove('active');

  document.querySelector('#announcements-tab').classList.add('active');
  courseView.innerHTML = '<h4>Announcements</h4>';

  try {
    let response = await fetch(`/course/${courseID}/announcements`);
    let result = await response.json();
    let announcements = result['announcements'];
    console.log(announcements);

    let annWrapper = document.createElement('div');
    annWrapper.classList.add('container');
    annWrapper.setAttribute('id', 'ann-wrapper');

    // Prep a header to label columns
    let header = document.createElement('div');
    header.classList.add('row', 'header');

    let titleHeader = document.createElement('div');
    titleHeader.classList.add('col-sm-8');
    titleHeader.innerHTML = 'Title';
    header.append(titleHeader);

    let dateHeader = document.createElement('div');
    dateHeader.classList.add('col-sm-4');
    dateHeader.innerHTML = 'Time Posted';
    header.append(dateHeader);

    annWrapper.append(header);

    // Iterate through each announcement and display it as you go.
    for (let ann of announcements) {
      let row = document.createElement('div');
      row.classList.add('row');
      // row.setAttribute('id', `ann-id${ann['id']}`);
      // row.dataset.annId = ann['id'];

      let titleCol = document.createElement('div');
      titleCol.classList.add('col-sm-8');
      titleCol.innerHTML = `<a href="#" data-ann-id=${ann['id']} id="ann-id${ann['id']}">
                            ${ann['title']}</a>`;
      row.append(titleCol);

      let timeCol = document.createElement('div');
      timeCol.classList.add('col-sm-4');
      timeCol.innerHTML = ann['timestamp'];
      row.append(timeCol);

      annWrapper.append(row);

    }
    courseView.append(annWrapper);

  }
  catch (error) {
    console.log(error);
  }

}
async function displayAnnouncement(announcement) {
  courseView.innerHTML = "";

  courseView.innerHTML = `
    <h4>${announcement['title']}</h4>
    <p><small>Posted ${announcement['timestamp']}</small></p>
    <p>${announcement['body']}</p>
    <p><a id="back-ann" href="#">Back</a></p>
    `
}


async function displayAssignments() {
  document.querySelector('.sidebar .active').classList.remove('active');

  document.querySelector('#assignments-tab').classList.add('active');
  courseView.innerHTML = '<h4>Assignments</h4>';

  try {
    let response = await fetch(`/course/${courseID}/assignments`);
    let result = await response.json();
    let assignments = result['assignments'];
    console.log(assignments);

    let assnWrapper = document.createElement('div');
    assnWrapper.classList.add('container');
    assnWrapper.setAttribute('id', 'ann-wrapper');

    // Prep a header to label columns
    let header = document.createElement('div');
    header.classList.add('row', 'header');

    let titleHeader = document.createElement('div');
    titleHeader.classList.add('col-sm-8');
    titleHeader.innerHTML = 'Title';
    header.append(titleHeader);

    let dateHeader = document.createElement('div');
    dateHeader.classList.add('col-sm-4');
    dateHeader.innerHTML = 'Time Posted';
    header.append(dateHeader);

    assnWrapper.append(header);

    // Iterate through each assignment and display it as you go.
    for (let assn of assignments) {
      let row = document.createElement('div');
      row.classList.add('row');
      // row.setAttribute('id', `assn-id${assn['id']}`);
      // row.dataset.assnId = assn['id'];

      let titleCol = document.createElement('div');
      titleCol.classList.add('col-sm-8');
      titleCol.innerHTML = `<a href="#" data-assn-id="${assn['id']}" id="assn-id${assn['id']}">
                              ${assn['title']}</a>`;
      row.append(titleCol);

      let timeCol = document.createElement('div');
      timeCol.classList.add('col-sm-4');
      timeCol.innerHTML = assn['timestamp'];
      row.append(timeCol);

      assnWrapper.append(row);

    }
    courseView.append(assnWrapper);

  }
  catch (error) {
    console.log(error);
  }
}

async function displayAssignment(response) {
  courseView.innerHTML = "";
  let assignment = response['assignment'];

  courseView.innerHTML = `
    <h4>${assignment['title']}</h4>
    <p><small>Posted ${assignment['timestamp']}</small></p>
    <p>${assignment['body']}</p>
  `
  if (assignment['attachment'] != "None") {
    courseView.innerHTML += `
      <h5>Attachment:</h5>
      <p><a download href="/course/${courseID}/assignments/${assignment['id']}/attachment">
        ${assignment['attachment']}</a></p>
    `;
  }
  if (!response['submitted']) {
    courseView.innerHTML += `
      <h5>Upload Assignment</h5>
      <form action="/course/${courseID}/assignments/${assignment['id']}/submit" method=POST enctype="multipart/form-data">
        <input type="file" id="sbmit-assn" name="attachment"> <br>
        <p>Or type assignment:</p>
        <div class="input-group">
          <textarea class="form-control" name="typed" placeholder="Type your assignment"></textarea>
        </div>
        <input type="submit" id="sbmit-btn" class="btn btn-primary" value="Submit Assignment">
      </form>`
  }
  else {
    courseView.innerHTML += `
      <p>Assignment submitted. Check submissions tab.</p>
    `
  }
  courseView.innerHTML += `<p><a id="back-assn" href="#">Back</a></p>`;

}

function displaySubmissions() {
  document.querySelector('.sidebar .active').classList.remove('active');

  document.querySelector('#submissions-tab').classList.add('active');
  courseView.innerHTML = '<h4>Submissions</h4>';

}
