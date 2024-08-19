from django.shortcuts import render, reverse, redirect
from django.http import HttpResponseRedirect, JsonResponse, FileResponse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.views.decorators.csrf import csrf_exempt
from .models import User, Student, Instructor, Course, Assignment, Submission, Announcement

# from markdown2 import markdown


# Create your views here.


@login_required
def get_submissions(request, course_id, student_id=None, sbmsn_id=None):
    try:
        if sbmsn_id:
            submission = Submission.objects.get(pk=sbmsn_id)
            return JsonResponse({"submission": submission.serialize()})

        else:
            course = Course.objects.get(pk=course_id)
            student = Student.objects.get(pk=student_id)
            submissions = Submission.objects.filter(
                course=course, student=student)
            print(submissions)
            return JsonResponse({"submissions": [
                sbmsn.serialize() for sbmsn in submissions]}, status=201)

    except Submission.DoesNotExist:
        pass


# We need to check for a file and for a body, then we need to
# make a new submission with the received data and save it.
@csrf_exempt
@login_required
def submit_assignment(request, course_id, assn_id):
    # This works for submitting the typed assignment.
    # Now we have to figure out how to add the file...
    student = request.user.student
    course = Course.objects.get(pk=course_id)
    assignment = Assignment.objects.get(pk=assn_id)
    # Uhhh how do I find out if there is already a Submission
    # for this assignment
    if assignment.submissions.filter(student=student) is not None:
        return JsonResponse({"message": "Error: a submission already exists."},
                            status=400)
    typed = request.POST['typed']
    try:
        attachment = request.FILES['attachment']
    except:
        attachment = "None"
    submission = Submission(student=student, course=course,
                            assignment=assignment, attachment=attachment,
                            body=typed)
    submission.save()
    return redirect("course", 1)


@login_required
def get_attachment(request, course_id, assn_id=None, sbmsn_id=None):
    if sbmsn_id:
        submission = Submission.objects.get(pk=sbmsn_id)
        attachment = submission.attachment
        pass
    else:
        assignment = Assignment.objects.get(pk=assn_id)
        attachment = assignment.attachment
    return FileResponse(open(attachment.url[1:], "rb"), as_attachment=True)


# Get assignments for previewing. We should also get grades
# associated with each...
@login_required
def get_assignments(request, course_id, assn_id=None):
    try:
        if assn_id:
            assignment = Assignment.objects.get(pk=assn_id)
            try:
                submission = assignment.submissions.get(
                    student=request.user.student)
                grade = submission.grade
                return JsonResponse(
                    {"assignment": assignment.serialize(),
                     "submitted": True,
                     "grade": grade}, status=201)
            except Submission.DoesNotExist:
                return JsonResponse(
                    {"assignment": assignment.serialize(),
                     "submitted": False}, status=201)

        else:
            course = Course.objects.get(pk=course_id)
            assignments = Assignment.objects.filter(course=course)
            assignments = assignments.order_by("-timestamp").all()
            assn_list = []
            for assn in assignments:
                # This data depends on the user who made the request
                # and thus cannot be accounted for in the serialze function.
                # It must be retrieved when the request is made.
                serialized = assn.serialize()
                try:
                    submission = assn.submissions.get(
                        student=request.user.student)
                    grade = submission.grade
                    if grade is None:
                        serialized['grade'] = "None"
                    else:
                        serialized['grade'] = grade

                    serialized['submitted'] = True
                except Submission.DoesNotExist:
                    serialized['grade'] = "None"
                    serialized['submitted'] = False

                assn_list.append(serialized)

            return JsonResponse({"assignments": assn_list},
                                status=201)

    except Course.DoesNotExist:
        return JsonResponse({"error": "Course does not exist."}, status=400)
    except Assignment.DoesNotExist:
        return JsonResponse({"error": "Assignment does not exist."},
                            status=400)


# Get the body of a course's front page.
@login_required
def get_announcements(request, course_id, ann_id=None):
    try:
        if ann_id:
            announcement = Announcement.objects.get(pk=ann_id)
            return JsonResponse(announcement.serialize())

        else:
            course = Course.objects.get(pk=course_id)
            announcements = Announcement.objects.filter(course=course)
            announcements = announcements.order_by("-timestamp").all()
            print(announcements)
            return JsonResponse({"announcements": [
                                ann.serialize() for ann in announcements]},
                                status=201)

    except Course.DoesNotExist:
        return JsonResponse({"error": "Course does not exist."}, status=400)
    except Announcement.DoesNotExist:
        return JsonResponse({"error": "Announcement does not exist."},
                            status=400)


# View for a course. Provides both the course and whether or not
# the user is the instructor for that course.
@login_required
def course(request, course_id):
    try:
        course = Course.objects.get(pk=course_id)
        return render(request, "learning/course.html", {
            "course": course,
            "is_instructor": (request.user.instructor == course.instructor)
        })

    except Course.DoesNotExist:
        return render(request, "learning/course.html", {
            "message": f"404: No course with id {course_id}"},
            status=404)


@login_required
def index(request):
    student_courses = request.user.student.courses.filter(
        students=request.user.student)
    instructor_courses = request.user.instructor.courses.filter(
        instructor=request.user.instructor)
    return render(request, "learning/index.html", {
        "student_courses": student_courses,
        "instructor_courses": instructor_courses
    })


def login_view(request):
    if request.method == "POST":
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(username=username, password=password)

        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse('index'))
        else:
            return render(request, "learning/login.html", {
                "message": "Error: There is no account with that username and password."
            })
    else:
        return render(request, "learning/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("login"))


def register(request):
    if request.method == "POST":
        username = request.POST['username']
        password = request.POST['password']
        confirmation = request.POST['confirmation']
        # Confirm that passwords match
        if password != confirmation:
            return render(request, "learning/register.html", {
                "message": "Error: Passwords do not match."
            })
        # Try to create the user, display an error if it is not available.
        try:
            user = User.objects.create_user(username=username,
                                            password=password)
            user.save()
            # Create the Student and Instructor models
            student = Student(user=user)
            student.save()
            instructor = Instructor(user=user)
            instructor.save()
            authenticate(username=username, password=password)
            return HttpResponseRedirect(reverse('index'))
        except IntegrityError:
            return render(request, "learning/register.html", {
                "message": "Error: That username or email is taken."
            })
    else:
        return render(request, "learning/register.html")
