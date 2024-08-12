from django.contrib import admin

from .models import Instructor, Student, Course, Announcement, Assignment, Submission

# Register your models here.

admin.site.register(Instructor)
admin.site.register(Student)
admin.site.register(Course)
admin.site.register(Announcement)
admin.site.register(Assignment)
admin.site.register(Submission)
