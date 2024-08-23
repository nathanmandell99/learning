document.addEventListener('DOMContentLoaded', () => {
  // From here we can use API calls to retrieve everything we need to know about the course.
  if (isEnrolled || isInstructor) {
    const descTab = document.querySelector('#description-tab');
    descTab.addEventListener('click', displaySyllabus);

    const annTab = document.querySelector('#announcements-tab');
    annTab.addEventListener('click', displayAnnouncements);

    const assTab = document.querySelector('#assignments-tab');
    assTab.addEventListener('click', displayAssignments);

    const submTab = document.querySelector('#submissions-tab');
    submTab.addEventListener('click', displaySubmissions);

    if (isInstructor) {
      document.querySelector('.title h2').innerHTML += ' (Instructor View)';
    }

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
      displayAnnouncement(annId);
    }
    else if (event.target.id === "back-ann") {
      displayAnnouncements();
    }
    else if (event.target.id.includes("assn-id")) {
      let assnId = event.target.dataset.assnId;
      displayAssignment(assnId);
    }
    else if (event.target.id === "back-assn") {
      displayAssignments();
    }
    else if (event.target.id.includes("sbmsn-id")) {
      let sbmsnId = event.target.dataset.sbmsnId;
      let sbmsnStudentId = event.target.dataset.studentId;
      let response = await fetch(`/course/${courseID}/submissions/${sbmsnStudentId}/${sbmsnId}`);
      let result = await response.json();
      console.log(result);
      let submission = result['submission'];
      displaySubmission(submission);
    }
    else if (event.target.id === "back-sbmsn") {
      displaySubmissions();
    }
    else if (event.target.id === "edit-syllabus") {

      let currentSyllabus = document.querySelector('#syllabus-body');
      let currentBody = currentSyllabus.innerHTML;

      let turndownService = new TurndownService()
      let markdown = turndownService.turndown(currentBody)

      courseView.innerHTML = `
        <textarea class="form-control" id="new-syllabus-body">${markdown}</textarea>
        <button class="btn btn-primary" id="send-syllabus-edit">Submit Edit</button>
      `;
    }
    else if (event.target.id === "send-syllabus-edit") {
      let newSyllabus = document.querySelector('#new-syllabus-body').value;

      try {
        let response = await fetch(`/course/${courseID}/front-page/edit`, {
          method: "PUT",
          body: JSON.stringify({
            new_front_page: newSyllabus
          })
        });
        let result = await response.json();

        console.log(result);
        displaySyllabus();

      }
      catch (error) {
        console.log(error);
      }
    }
    else if (event.target.id === "edit-ann") {

      let currentAnn = document.querySelector('#ann-body');
      let annID = currentAnn.dataset.annId;
      console.log(`annID: ${annID}`);
      let currentBody = currentAnn.innerHTML;

      //console.log(currentBody);

      let turndownService = new TurndownService();
      let markdown = turndownService.turndown(currentBody);

      courseView.innerHTML = `
        <textarea class="form-control" data-ann-id="${annID}" id="new-ann-body">${markdown}</textarea>
        <button class="btn btn-primary" id="send-ann-edit">Submit Edit</button>
      `;
    }
    else if (event.target.id === "send-ann-edit") {
      let newBody = document.querySelector('#new-ann-body');
      let annID = newBody.dataset.annId;
      console.log(`annID: ${annID}`);

      try {
        let response = await fetch(`/course/${courseID}/announcements/${annID}/edit`, {
          method: "PUT",
          body: JSON.stringify({
            new_ann_body: newBody.value
          })
        });
        let result = await response.json();

        console.log(result);

        displayAnnouncement(annID);
      }
      catch (error) {
        console.log(error);
      }
    }
    else if (event.target.id === "edit-assn") {
      let currentAssn = document.querySelector('#assn-body');
      let assnID = currentAssn.dataset.annId;
      let currentBody = currentAssn.innerHTML;

      let turndownService = new TurndownService();
      let markdown = turndownService.turndown(currentBody);

      // Setting this up as a form makes it easier to handle the attachment
      courseView.innerHTML = `
        <form action="/course/${courseID}/assignments/${assnID}/edit" method="POST" enctype="multipart/form-data">
          <textarea name="new_assn_body" class="form-control" data-assn-id="${assnID}" id="new-assn-body">${markdown}</textarea>
          <input type="file" name="attachment" /> <br>
          <button class="btn btn-primary" id="send-assn-edit">Submit Edit</button>
        </form>
      `;
    }
    else if (event.target.id === "send-assn-edit") {
      event.preventDefault();
      formElem = event.target.closest('form');
      let form = new FormData(formElem);
      let assnID = document.querySelector('#new-assn-body').dataset.assnId
      console.log(form);
      try {
        let response = await fetch(`/course/${courseID}/assignments/${assnID}/edit`, {
          method: 'POST',
          body: form
        });
        let result = response.json();
        console.log(result);
      }
      catch (error) {
        console.log(error);
      }
      displayAssignment(assnID);
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
    // console.log(result);

    courseView.innerHTML = `
    <div id="syllabus-body">
      ${result['front_page']}
    </div>
    `;
    if (isInstructor) {
      // Display button to edit syllabus
      courseView.innerHTML += `
      <div id="edit-btn-div">
        <p><a id="edit-syllabus" href="#">Edit</a></p>
      </div>
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
async function displayAnnouncement(annId) {
  try {
    let response = await fetch(`/course/${courseID}/announcements/${annId}`);
    let announcement = await response.json();
    courseView.innerHTML = "";

    courseView.innerHTML = `
      <h4>${announcement['title']}</h4>
      <p><small>Posted ${announcement['timestamp']}</small></p>
      <div id="ann-body" data-ann-id="${announcement['id']}">
        ${announcement['body']}
      </div>
      `;
    if (isInstructor) {
      // Display button to edit syllabus
      courseView.innerHTML += `
        <div id="edit-btn-div">
          <p><a id="edit-ann" href="#">Edit</a></p>
        </div>
      `;
    }
    courseView.innerHTML += `<p><a id="back-ann" href="#">Back</a></p>`;

  }
  catch (error) {
    console.log(error);
  }
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

async function displayAssignment(assnId) {
  try {
    let response = await fetch(`/course/${courseID}/assignments/${assnId}`);
    let result = await response.json();
    let assignment = result['assignment'];
    courseView.innerHTML = "";

    courseView.innerHTML = `
      <h4>${assignment['title']}</h4>
      <p><small>Posted ${assignment['timestamp']}</small></p>
      <div id="assn-body" data-ann-id="${assignment['id']}">
        ${assignment['body']}
      </div>
    `
    if (assignment['attachment'] != "None") {
      courseView.innerHTML += `
        <h5>Attachment:</h5>
        <p><a download href="/course/${courseID}/assignments/${assignment['id']}/attachment">
          ${assignment['attachment']}</a></p>
      `;
    }
    if (!result['submitted'] && isEnrolled) {
      console.log(`result['submitted']: ${result['submitted']}`)
      courseView.innerHTML += `
        <hr>
        <h5>Upload Assignment</h5>
        <form action="/course/${courseID}/assignments/${assignment['id']}/submit" method=POST enctype="multipart/form-data">
          <input type="file" id="sbmit-assn" name="attachment" /> <br>
          <p>Or type assignment:</p>
          <div class="input-group">
            <textarea class="form-control" name="typed" placeholder="Type your assignment"></textarea>
          </div>
          <input type="submit" id="sbmit-btn" class="btn btn-primary" value="Submit Assignment">
        </form>`
    }
    else if (isEnrolled) {
      courseView.innerHTML += `
        <hr>
        <p><em>Assignment submitted. Check submissions tab.</em></p>
      `
    }
    else { // user is instructor
      courseView.innerHTML += `
        <hr>
        <p><em>Check submissions for this assignment in the "submissions" tab.</em></p>
        <div id="edit-btn-div">
          <p><a id="edit-assn" href="#">Edit</a></p>
        </div>
      `
    }
    courseView.innerHTML += `<p><a id="back-assn" href="#">Back</a></p>`;

  }
  catch (error) {
    console.log(error);
  }

}

async function displaySubmissions() {
  document.querySelector('.sidebar .active').classList.remove('active');

  document.querySelector('#submissions-tab').classList.add('active');
  courseView.innerHTML = `<h4>Submissions</h4>
  <div id="graded"><h5>Graded</h5></div>
  <div id="ungraded"><h5>Ungraded</h5></div>
    `;

  try {
    let response;
    if (isInstructor) {
      response = await fetch(`/course/${courseID}/submissions/all`);
    }
    else {
      response = await fetch(`/course/${courseID}/submissions/${studentID}`)
    }
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
    gradedWrapper.setAttribute('id', 'sbmsn-wrapper');

    let ungradedWrapper = document.createElement('div');
    ungradedWrapper.classList.add('container');
    ungradedWrapper.setAttribute('id', 'sbmsn-wrapper');

    // Prep a header to label columns
    let gradedSectionHeader = document.createElement('div');
    gradedSectionHeader.classList.add('row', 'header');
    let ungradedSectionHeader = document.createElement('div');
    ungradedSectionHeader.classList.add('row', 'header');

    let titleHeader = document.createElement('div');
    titleHeader.classList.add('col-sm-8');
    titleHeader.innerHTML = 'Title';
    ungradedSectionHeader.append(titleHeader);
    gradedSectionHeader.append(titleHeader.cloneNode(true));

    let gradeHeader = document.createElement('div');
    gradeHeader.classList.add('col-sm-2');
    gradeHeader.innerHTML = 'Grade';
    gradedSectionHeader.append(gradeHeader);

    let dummyHeader = document.createElement('div');
    dummyHeader.classList.add('col-sm-2');
    dummyHeader.innerHTML = '';
    ungradedSectionHeader.append(dummyHeader);

    let studentHeader = document.createElement('div');
    studentHeader.classList.add('col-sm-2');
    studentHeader.innerHTML = 'Student';
    gradedSectionHeader.append(studentHeader);
    ungradedSectionHeader.append(studentHeader.cloneNode(true));

    gradedWrapper.append(gradedSectionHeader);
    ungradedWrapper.append(ungradedSectionHeader);

    for (let sbmsn of graded) {
      let row = document.createElement('div');
      row.classList.add('row');

      let titleCol = document.createElement('div');
      titleCol.classList.add('col-sm-8');
      titleCol.innerHTML = `<a href="#" data-student-id="${sbmsn['studentID']}" data-sbmsn-id="${sbmsn['id']}" id="sbmsn-id${sbmsn['id']}">
                            Submission for ${sbmsn['assignmentName']} on ${sbmsn['timestamp']}</a>`;
      row.append(titleCol);

      let gradeCol = document.createElement('div');
      gradeCol.classList.add('col-sm-2');
      gradeCol.innerHTML = `${sbmsn['grade']}/100`;
      row.append(gradeCol);

      let studentCol = document.createElement('div');
      studentCol.classList.add('col-sm-2');
      studentCol.innerHTML = `${sbmsn['studentName']}`;
      row.append(studentCol);

      gradedWrapper.append(row);
    }

    for (let sbmsn of ungraded) {
      let row = document.createElement('div');
      row.classList.add('row');

      let titleCol = document.createElement('div');
      titleCol.classList.add('col-sm-8');
      titleCol.innerHTML = `<a href="#" data-student-id="${sbmsn['studentID']}" data-sbmsn-id="${sbmsn['id']}" id="sbmsn-id${sbmsn['id']}">
                            Submission for ${sbmsn['assignmentName']} on ${sbmsn['timestamp']}</a>`;
      row.append(titleCol);

      let fillerCol = document.createElement('div');
      fillerCol.classList.add('col-sm-2');
      fillerCol.innerHTML = ``;
      row.append(fillerCol);

      let studentCol = document.createElement('div');
      studentCol.classList.add('col-sm-2');
      studentCol.innerHTML = `${sbmsn['studentName']}`;
      row.append(studentCol);

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
      <p>Student: ${submission['studentName']}</p>
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
    <h5>Submission:</h5>
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
    `;
  }
  courseView.innerHTML += `<p><a id="back-sbmsn" href="#">Back</a></p>`;
}
