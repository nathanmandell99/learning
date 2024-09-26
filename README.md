# Learning
Mockup learning management webapp in the vein of Canvas or Blackboard. Written using Django and
plain HTML/CSS/JavaScript.

Users can create courses. Each course has a front page/syllabus, announcements, assignments, and submissions.

When a user creates a course, that user is the instructor for the course. Any students that will
be in the course are chosen by the instructor when he/she makes the course. The instructor can
create new announcements and assignments, grade submissions, and edit the front page, as well as
all announcements and assignments. Instructors are able to view all submissions from all students.

Students can view most of what the instructor can. However, they cannot edit any course material.
Students can make one submission for each assignment, and view their own submissions. Once the
instructor has graded a submission, the grade and any comments left by the instructor are
available for the student to view.

The bulk of the app is the course page. There is also a page for creating a new course and a page
for browsing courses available to the current user. A user cannot view a course that he/she is
neither an instructor nor a student for.

The course page is only one page. Different views within the course page are accessed through
JavaScript, which makes API calls to the backend running in Python.

# Files

## views.py 

This mostly contains backend routes that are called by the frontend, but it also provides 
context for Django HTML templates and serves them.

## models.py 

Contains all models used by views.py. The models include: User, Student, Instructor, Course,
Assignment, Submission, and Announcement.

Student and Instructor serve as a sort of "wrapper" for User. Whenever a User is created, an 
Instructor and a Student are created and associated with that User. Instructor and Student have 
no properties other than the associated User. Instead, other models associate themselves with 
them. For example, each Course has a ForeignKey to be associated with an Instructor; said
Instructor is the instructor of that course. Courses also have a ManyToMany relationship with 
Students; many students can be associated with many courses.

## urls.py 

A standard Django urls.py file. Separated by urls which serve templates and urls which are 
intended to be used as API calls.

## layout.html 

Serves the banner to be used on each page. Also includes Bootstrap to be used by other templates.

## index.html

Home page which displays a list of all courses that the user is associated with, either as an 
instructor or as a student.

## login.html

Standard login page. Client provides username and password which is verified by the backend.

## register.html

Standard registration page. Client provides username, password, and confirms password. A new User
is created with the supplied information, as well as an associated Instructor and Student.

## course.js 

This serves pretty much all of the functionality for a Course to the client. When the DOM 
content is loaded, event listeners are attached to each tab to load the respective view.
Each view is accessed through a function associated with said view; for example, the front page/
syllabus is accessed with 'displaySyllabus()'.

## eventdelegator.js 

A myriad of views are handled outside of the main sidebar nav; they are processed by this file.
Examples include viewing individual announcements/assignments, editing the same, or submitting
new information such as a submission or editing existing information such as an assignment.

## styles.css 

Standard CSS file. Note that this contains code adapted from w3schools; the citation is located
within the file.

# How to Run 

`python manage.py runserver` is sufficient to run the project on the Django dev server. It can
then be accessed from localhost:8000, the same as previous projects in the course.
