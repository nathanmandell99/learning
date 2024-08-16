from django.shortcuts import render, reverse
from django.http import HttpResponseRedirect, JsonResponse, FileResponse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from .models import User, Student, Instructor, Course, Assignment, Submission, Announcement


# Create your views here.


@login_required
def get_attachment(request, course_id, assn_id):
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
                assignment.submissions.get(student=request.user.student)
                submitted = True
            except Submission.DoesNotExist:
                submitted = False
            return JsonResponse(
                {"assignment": assignment.serialize(),
                 "submitted": submitted})

        else:
            course = Course.objects.get(pk=course_id)
            assignments = Assignment.objects.filter(course=course)
            assignments = assignments.order_by("-timestamp").all()
            print(assignments)
            return JsonResponse({"assignments": [assn.serialize() for assn in assignments]})

    except Course.DoesNotExist:
        return JsonResponse({"error": "Course does not exist."})
    except Assignment.DoesNotExist:
        return JsonResponse({"error": "Assignment does not exist."})


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
            return JsonResponse({"announcements": [ann.serialize() for ann in announcements]})

    except Course.DoesNotExist:
        return JsonResponse({"error": "Course does not exist."})
    except Announcement.DoesNotExist:
        return JsonResponse({"error": "Announcement does not exist."})


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
            "message": f"404: No course with id {course_id}"
        })
        pass
        # Render a 404


@login_required
def index(request):
    # print(request.user.student.courses.filter(students=request.user.student))
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
