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
      displaySubmission(sbmsnId, sbmsnStudentId);
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
        <br>
        <a href="#" id="back-edit-syllabus">Back</a>
      `;
    }
    else if (event.target.id === "back-edit-syllabus") {
      displaySyllabus();
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
        alert(error);
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
        <br>
        <a href="#" id="back-edit-ann" data-ann-id="${annID}">Back</a>
      `;
    }
    else if (event.target.id === "back-edit-ann") {
      let annID = event.target.dataset.annId;
      displayAnnouncement(annID);
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
        alert(error);
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
          <br>
          <a href="#" id="back-edit-assn" data-assn-id="${assnID}">Back</a>
        </form>
      `;
    }
    else if (event.target.id === "send-assn-edit") {
      event.preventDefault();
      let formElem = event.target.closest('form');
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
        alert(error);
      }
      displayAssignment(assnID);
    }
    else if (event.target.id === "back-edit-assn") {
      let assnID = event.target.dataset.assnId;
      displayAssignment(assnID);
    }
    else if (event.target.id === "create-ann-view") {
      newAnnouncementView()
    }
    else if (event.target.id === "post-new-ann") {
      let annBody = document.querySelector('#new-ann-body').value;
      let annTitle = document.querySelector('#new-ann-title').value;

      try {
        let response = await fetch(`/course/${courseID}/announcements/new`, {
          method: "POST",
          body: JSON.stringify({
            ann_body: annBody,
            ann_title: annTitle
          })
        });
        let result = await response.json();

        console.log(result);
        console.log(result['ann_id'])
        displayAnnouncement(result['ann_id']);
      }
      catch (error) {
        alert(error);
      }
    }
    else if (event.target.id === "create-assn-view") {
      newAssignmentView()
    }
    else if (event.target.id === "post-new-assn") {
      event.preventDefault();
      let formElem = document.querySelector('#new-assn-form');
      console.log(formElem);
      let form = new FormData(formElem);

      try {
        let response = await fetch(`/course/${courseID}/assignments/new`, {
          method: 'POST',
          body: form
        });
        let result = await response.json();
        console.log(result);

        displayAssignment(result['assn_id']);
      }
      catch (error) {
        alert(error);
      }
    }
    else if (event.target.id === "sbmit-grade") {
      // We should handle verifying the value of the grade
      // in the backend
      let grade = parseInt(document.querySelector('#grade').value);
      let comments = document.querySelector('#comments').value;
      let sbmsnID = event.target.dataset.sbmsnId;
      let sbmsnStudentId = event.target.dataset.studentId;
      console.log(sbmsnID);
      console.log(grade);
      console.log(comments);

      try {
        let response = await fetch(`/course/${courseID}/submissions/${sbmsnID}/grade`, {
          method: 'POST',
          body: JSON.stringify({
            grade: grade,
            comments: comments
          })

        })
        let result = await response.json();
        console.log(result);
        displaySubmission(sbmsnID, sbmsnStudentId);
      }
      catch (error) {
        alert(error);
      }

    }
  });
}
