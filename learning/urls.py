from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("register", views.register, name="register"),
    path("logout", views.logout_view, name="logout"),
    path("course/<int:course_id>", views.course, name="course"),
    path("course/new", views.new_course, name="new_course"),

    # API routes

    path("course/<int:course_id>/announcements",
         views.get_announcements, name="get_announcements"),
    path("course/<int:course_id>/announcements/<int:ann_id>",
         views.get_announcements, name="get_announcement"),
    path("course/<int:course_id>/announcements/<int:ann_id>/edit",
         views.edit_announcement, name="edit_announcement"),
    path("course/<int:course_id>/announcements/new",
         views.new_announcement, name="new_announcement"),

    path("course/<int:course_id>/assignments",
         views.get_assignments, name="get_assignments"),
    path("course/<int:course_id>/assignments/<int:assn_id>",
         views.get_assignments, name="get_assignment"),
    path("course/<int:course_id>/assignments/<int:assn_id>/attachment",
         views.get_attachment, name="get_attachment"),
    path("course/<int:course_id>/assignments/<int:assn_id>/submit",
         views.submit_assignment, name="submit_assignment"),
    path("course/<int:course_id>/assignments/<int:assn_id>/edit",
         views.edit_assignment, name="edit_assignment"),
    path("course/<int:course_id>/assignments/new",
         views.new_assignment, name="new_assignment"),

    path("course/<int:course_id>/submissions/<int:student_id>",
         views.get_submissions, name="get_submissions"),
    path("course/<int:course_id>/submissions/<int:student_id>/<int:sbmsn_id>",
         views.get_submissions, name="get_submission"),
    path("course/<int:course_id>/submissions/<int:sbmsn_id>/attachment",
         views.get_attachment, name="get_sbmsn_attachment"),
    path("course/<int:course_id>/submissions/all",
         views.get_all_submissions, name="get_all_submissions"),
    path("course/<int:course_id>/submissions/<int:sbmsn_id>/grade",
         views.grade_submission, name="grade_submission"),

    path("course/<int:course_id>/front-page",
         views.get_front_page, name="get_front_page"),
    path("course/<int:course_id>/front-page/edit",
         views.edit_front_page, name="edit_front_page")
]
