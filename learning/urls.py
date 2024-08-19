from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("register", views.register, name="register"),
    path("logout", views.logout_view, name="logout"),
    path("course/<int:course_id>", views.course, name="course"),

    # APIs

    path("course/<int:course_id>/announcements",
         views.get_announcements, name="get_announcements"),
    path("course/<int:course_id>/announcements/<int:ann_id>",
         views.get_announcements, name="get_announcement"),

    path("course/<int:course_id>/assignments",
         views.get_assignments, name="get_assignments"),
    path("course/<int:course_id>/assignments/<int:assn_id>",
         views.get_assignments, name="get_assignment"),
    path("course/<int:course_id>/assignments/<int:assn_id>/attachment",
         views.get_attachment, name="get_attachment"),
    path("course/<int:course_id>/assignments/<int:assn_id>/submit",
         views.submit_assignment, name="submit_assignment"),

    path("course/<int:course_id>/submissions/<int:student_id>",
         views.get_submissions, name="get_submissions"),
    path("course/<int:course_id>/submissions/<int:student_id>/<int:sbmsn_id>",
         views.get_submissions, name="get_submission"),
    path("course/<int:course_id>/submissions/<int:sbmsn_id>/attachment",
         views.get_attachment, name="get_sbmsn_attachment"),
]
