from django.contrib.auth.models import User
from django.db import models
from django.core.validators import MaxValueValidator
from . import utils

# Create your models here.


class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE,
                                related_name='student')

    def __str__(self):
        return self.user.username


class Instructor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE,
                                related_name='instructor')

    def __str__(self):
        return self.user.username


class Course(models.Model):
    # For simplicity, only one instructor per course.
    instructor = models.ForeignKey('Instructor', on_delete=models.CASCADE,
                                   related_name='courses')
    students = models.ManyToManyField('Student', related_name='courses',
                                      blank=True)
    title = models.CharField(max_length=256)
    frontPage = models.CharField(max_length=10240)

    def __str__(self):
        return f"{self.title}, taught by {self.instructor.user.username}"


class Announcement(models.Model):
    title = models.CharField(max_length=256)
    body = models.CharField(max_length=10240)
    timestamp = models.DateTimeField(auto_now_add=True)
    course = models.ForeignKey('Course', on_delete=models.CASCADE,
                               related_name='announcements')

    def __str__(self):
        return f"{self.course.title}: {self.title}"


class Assignment(models.Model):
    title = models.CharField(max_length=256)
    body = models.CharField(max_length=10240)
    timestamp = models.DateTimeField(auto_now_add=True)
    course = models.ForeignKey('Course', on_delete=models.CASCADE,
                               related_name='assignments')

    attachment = models.FileField(upload_to=utils.get_path, blank=True)

    def __str__(self):
        return f"{self.course.title}: {self.title}"


# class Quiz(models.Model):
    # pass


# class MultChoiceQuestion(models.Model):
    # pass


# How can we make it so that finding the submission of a specific student for
# an assignment is straightforward?
# Could be something like: assignment.submissions.get(student=some_student)
class Submission(models.Model):
    student = models.ForeignKey('Student', on_delete=models.CASCADE,
                                related_name='submissions')
    course = models.ForeignKey('Course', on_delete=models.CASCADE,
                               related_name='submissions')
    assignment = models.ForeignKey('Assignment', on_delete=models.CASCADE,
                                   related_name='submissions')
    timestamp = models.DateTimeField(auto_now_add=True)
    attachment = models.FileField(upload_to=utils.get_path, blank=True)
    body = models.CharField(max_length=10240, blank=True)
    grade = models.IntegerField(validators=[MaxValueValidator(100)],
                                blank=True)
    graded = models.BooleanField(default=False)
