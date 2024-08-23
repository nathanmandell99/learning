from django.shortcuts import render, reverse, redirect
from django.http import HttpResponseRedirect, JsonResponse, FileResponse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.views.decorators.csrf import csrf_exempt
from django import forms
from django.forms import Textarea

from .models import User, Student, Instructor, Course, Assignment, Submission, Announcement

from markdown2 import Markdown
import json

markdowner = Markdown()


# Create your views here.
class CourseForm(forms.ModelForm):
    class Meta:
        model = Course
        fields = ['instructor', 'title', 'front_page', 'students']
        widgets = {
            'front_page': Textarea(attrs={'class': 'textField'}),
            'instructor': forms.HiddenInput(),
        }


# We're going to get the potential new attachment with:
# attachment = request.FILES['attachment']
@csrf_exempt
@login_required
def edit_assignment(request, course_id, assn_id):
    try:
        course = Course.objects.get(pk=course_id)
        if request.user.instructor == course.instructor:
            assignment = Assignment.objects.get(pk=assn_id)
            new_assn_body = request.POST['new_assn_body']
            try:
                new_attachment = request.FILES['attachment']
                assignment.attachment = new_attachment
            except:
                # If there is no attachment, we can just ignore it.
                pass
            assignment.body = new_assn_body
            assignment.save()
            return JsonResponse({"message": "Assignment updated."}, status=200)

        else:
            return JsonResponse({"message": "Error: You are not the instructor."},
                                status=400)
    except Course.DoesNotExist:
        return JsonResponse({"message": "Error: Course does not exist."},
                            status=400)
    except Assignment.DoesNotExist:
        return JsonResponse({"message": "Error: Assignment does not exist."},
                            status=400)


@csrf_exempt
@login_required
def edit_announcement(request, course_id, ann_id):
    try:
        course = Course.objects.get(pk=course_id)
        if course.instructor.id == request.user.instructor.id:
            ann = Announcement.objects.get(pk=ann_id)
            data = json.loads(request.body)
            new_ann_body = data.get("new_ann_body")
            ann.body = new_ann_body
            ann.save()
            return JsonResponse(
                {"message": "Announcement successfully updated.",
                 "new_ann_body": ann.body}, status=200)
    except Course.DoesNotExist:
        return JsonResponse({"message": "Error: Course does not exist."},
                            status=400)
    except Announcement.DoesNotExist:
        return JsonResponse({"message": "Error: Announcement does not exist."},
                            status=400)


@csrf_exempt
@login_required
def edit_front_page(request, course_id):
    try:
        course = Course.objects.get(pk=course_id)
        if course.instructor.id == request.user.instructor.id:
            data = json.loads(request.body)
            new_front_page = data.get("new_front_page")
            course.front_page = new_front_page
            course.save()
            return JsonResponse(
                {"message": "Front page successfully updated.",
                 "new_front_page": course.front_page})
        else:
            return JsonResponse({"message": "Error: You are not the instructor."},
                                status=400)
    except Course.DoesNotExist:
        return JsonResponse({"message": "Error: Course does not exist."},
                            status=400)


@login_required
def get_all_submissions(request, course_id):
    course = Course.objects.get(pk=course_id)
    if request.user.instructor == course.instructor:
        submissions = course.submissions.all()
        return JsonResponse({
            "submissions": [sbmsn.serialize() for sbmsn in submissions]
        }, status=200)


@login_required
def get_submissions(request, course_id, student_id=None, sbmsn_id=None):
    try:
        course = Course.objects.get(pk=course_id)
        if sbmsn_id:
            submission = Submission.objects.get(pk=sbmsn_id)
            if submission.student == request.user.student or course.instructor == request.user.instructor:
                return JsonResponse({"submission": submission.serialize()})
            else:
                return JsonResponse(
                    {"message": "Error: Submission does not belong to user making request."},
                    status=400)
        else:
            student = Student.objects.get(pk=student_id)
            if student == request.user.student or course.instructor == request.user.instructor:
                submissions = Submission.objects.filter(
                    course=course, student=student)
                return JsonResponse({"submissions": [
                    sbmsn.serialize() for sbmsn in submissions]}, status=200)
            else:
                return JsonResponse(
                    {"message": "Error: Submissions do not belong to user making request."},
                    status=400)

    except Submission.DoesNotExist:
        return JsonResponse({"message": "Error: Submission does not exist."},
                            status=400)
    except Course.DoesNotExist:
        return JsonResponse({"message": "Error: Course does not exist."},
                            status=400)


# We need to check for a file and for a body, then we need to
# make a new submission with the received data and save it.
@csrf_exempt
@login_required
def submit_assignment(request, course_id, assn_id):
    student = request.user.student
    course = Course.objects.get(pk=course_id)
    if student in course.students:
        assignment = Assignment.objects.get(pk=assn_id)
        print(assignment.submissions.filter(student=student))
        if assignment.submissions.filter(student=student).count() != 0:
            # TODO: Refactor this to not return a JsonResponse
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
        return redirect("course", course_id)
    else:
        # You are not a student for this class and cannot submit assignments!
        pass


@login_required
def get_attachment(request, course_id, assn_id=None, sbmsn_id=None):
    if sbmsn_id:
        submission = Submission.objects.get(pk=sbmsn_id)
        attachment = submission.attachment
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
                assignment.body = markdowner.convert(assignment.body)
                submission = assignment.submissions.get(
                    student=request.user.student)
                grade = submission.grade
                print("Submission exists")
                return JsonResponse(
                    {"assignment": assignment.serialize(),
                     "submitted": True,
                     "grade": grade}, status=200)
            except Submission.DoesNotExist:
                print("No submission")
                return JsonResponse(
                    {"assignment": assignment.serialize(),
                     "submitted": False}, status=200)

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
                                status=200)

    except Course.DoesNotExist:
        return JsonResponse({"error": "Course does not exist."}, status=400)
    except Assignment.DoesNotExist:
        return JsonResponse({"error": "Assignment does not exist."},
                            status=400)


@login_required
def get_announcements(request, course_id, ann_id=None):
    try:
        if ann_id:
            announcement = Announcement.objects.get(pk=ann_id)
            announcement.body = markdowner.convert(announcement.body)
            return JsonResponse(announcement.serialize())

        else:
            course = Course.objects.get(pk=course_id)
            announcements = Announcement.objects.filter(course=course)
            announcements = announcements.order_by("-timestamp").all()
            print(announcements)
            return JsonResponse({"announcements": [
                                ann.serialize() for ann in announcements]},
                                status=200)

    except Course.DoesNotExist:
        return JsonResponse({"error": "Course does not exist."}, status=400)
    except Announcement.DoesNotExist:
        return JsonResponse({"error": "Announcement does not exist."},
                            status=400)


@csrf_exempt
@login_required
def new_course(request):
    if request.method == "POST":
        # Save the new course
        form = CourseForm(request.POST)
        newcourse = form.save()
        return redirect("course", newcourse.id)
    return render(request, "learning/newcourse.html",
                  {"form": CourseForm(initial={'instructor': request.user.instructor})
                   })


@login_required
def get_front_page(request, course_id):
    try:
        course = Course.objects.get(pk=course_id)
        course.front_page = markdowner.convert(course.front_page)
        return JsonResponse({"front_page": course.front_page}, status=200)
    except Course.DoesNotExist:
        return JsonResponse({"error": "Course does not exist."}, status=400)


# View for a course. Provides both the course and whether or not
# the user is the instructor for that course.
@login_required
def course(request, course_id):
    try:
        course = Course.objects.get(pk=course_id)
        return render(request, "learning/course.html", {
            "course": course,
            "is_instructor": (request.user.instructor == course.instructor),
            "is_student": (request.user.student in course.students.all())
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
