document.addEventListener('DOMContentLoaded', () => {
  // From here we can use API calls to retrieve everything we need to know about the course.
  if (isEnrolled || isInstructor) {
    console.log('Student is enrolled.');
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
  }
  else {
    courseView.innerHTML = `<h4 class="err">Error: You are not enrolled in this course.</h4>`
  }
})

async function eventDelegator() {
  document.addEventListener('click', async (event) => {
    if (event.target.id.includes("ann-id")) {
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
      displayAssignment(assignment);
    }
    else if (event.target.id === "back-assn") {
      displayAssignments();
    }
    else if (event.target.id.includes("sbmsn-id")) {
      let sbmsnId = event.target.dataset.sbmsnId;
      let response = await fetch(`/course/${courseID}/submissions/${courseID}/${sbmsnId}`);
      let result = await response.json();
      let submission = result['submission'];
      displaySubmission(submission);
    }
    else if (event.target.id === "back-sbmsn") {
      displaySubmissions();
    }

  });
}

// Perhaps this should be refactored to call a backend route...
async function displaySyllabus() {
  // console.log('userID');
  document.querySelector('.sidebar .active').classList.remove('active');

  document.querySelector('#description-tab').classList.add('active');

  try {
    let response = await fetch(`/course/${courseID}/front-page`)
    let result = await response.json()
    console.log(result);

    courseView.innerHTML = result['front_page'];
    if (isInstructor) {
      // Display button to edit syllabus
      courseView.innerHTML += `
      <p><a id="edit-syllabus" href="#">Edit</a></p>
    `;
    }

  }
  catch (error) {
    console.log(error);
  }

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

async function displaySubmissions() {
  document.querySelector('.sidebar .active').classList.remove('active');

  document.querySelector('#submissions-tab').classList.add('active');
  courseView.innerHTML = `<h4>Submissions</h4>
  <div id="graded"><h5>Graded</h5></div>
  <div id="ungraded"><h5>Ungraded</h5></div>
    `;

  try {
    let response = await fetch(`/course/${courseID}/submissions/${studentID}`)
    let result = await response.json();
    let submissions = result['submissions'];
    console.log(submissions);

    let graded = [];
    let ungraded = [];
    for (let sbmsn of submissions) {
      sbmsn['graded'] === true ? graded.push(sbmsn) : ungraded.push(sbmsn);
    }

    let gradedWrapper = document.createElement('div');
    gradedWrapper.classList.add('container');
    gradedWrapper.setAttribute('id', 'ann-wrapper');

    let ungradedWrapper = document.createElement('div');
    ungradedWrapper.classList.add('container');
    ungradedWrapper.setAttribute('id', 'ann-wrapper');

    // Prep a header to label columns
    let gradedHeader = document.createElement('div');
    gradedHeader.classList.add('row', 'header');
    let ungradedHeader = document.createElement('div');
    ungradedHeader.classList.add('row', 'header');

    let titleHeader = document.createElement('div');
    titleHeader.classList.add('col-sm-8');
    titleHeader.innerHTML = 'Title';
    ungradedHeader.append(titleHeader);
    gradedHeader.append(titleHeader.cloneNode(true));

    let gradeHeader = document.createElement('div');
    gradeHeader.classList.add('col-sm-2');
    gradeHeader.innerHTML = 'Grade';
    gradedHeader.append(gradeHeader);

    gradedWrapper.append(gradedHeader);
    ungradedWrapper.append(ungradedHeader);

    for (let sbmsn of graded) {
      let row = document.createElement('div');
      row.classList.add('row');

      let titleCol = document.createElement('div');
      titleCol.classList.add('col-sm-8');
      titleCol.innerHTML = `<a href="#" data-sbmsn-id="${sbmsn['id']}" id="sbmsn-id${sbmsn['id']}">
                            Submission for ${sbmsn['assignmentName']} on ${sbmsn['timestamp']}</a>`;
      row.append(titleCol);

      let gradeCol = document.createElement('div');
      gradeCol.classList.add('col-sm-2');
      gradeCol.innerHTML = `${sbmsn['grade']}/100`;
      row.append(gradeCol);

      gradedWrapper.append(row);
    }

    for (let sbmsn of ungraded) {
      let row = document.createElement('div');
      row.classList.add('row');

      let titleCol = document.createElement('div');
      titleCol.classList.add('col-sm-8');
      titleCol.innerHTML = `<a href="#" data-sbmsn-id="${sbmsn['id']}" id="sbmsn-id${sbmsn['id']}">
                            Submission for ${sbmsn['assignmentName']} on ${sbmsn['timestamp']}</a>`;
      row.append(titleCol);

      ungradedWrapper.append(row);
    }

    document.querySelector('#graded').append(gradedWrapper);
    document.querySelector('#ungraded').append(ungradedWrapper);
  }
  catch (error) {
    console.log(error);
  }
}

async function displaySubmission(submission) {
  console.log(submission);
  courseView.innerHTML = `
      <h4>Submission for ${submission['assignmentName']}</h4>
      <p><small>Submitted ${submission['timestamp']}</small></p>
      `;

  if (submission['graded']) {
    courseView.innerHTML += `
      <h5>Grade:</h5>
      <p>${submission['grade']}/100</p>
      <h5>Instructor comments:</h5>
      <p>${submission['comments']}</p>
    `;
  }
  else {
    courseView.innerHTML += `
    <h5><strong>Assignment currently awaiting grading.</strong></h5>
    `;
  }
  courseView.innerHTML +=
    `<hr>
    <h5>What you submitted:</h5>
    <p>${submission['body']}</p>
    <h6>Attachment:</h6>`;

  if (submission['attachment'] != "None") {
    courseView.innerHTML += `
      <p><a download href="/course/${courseID}/submissions/${submission['id']}/attachment">
        ${submission['attachment']}</a></p>
    `;
  }
  else {
    courseView.innerHTML += `
      <p>None.</p>
    `
  }
  courseView.innerHTML += `<p><a id="back-sbmsn" href="#">Back</a></p>`;
}
