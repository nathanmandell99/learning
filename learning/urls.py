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
         views.get_announcements, name="getannouncements"),
    path("course/<int:course_id>/announcements/<int:ann_id>",
         views.get_announcements, name="getannouncement"),

    path("course/<int:course_id>/assignments",
         views.get_assignments, name="getassignments"),
    path("course/<int:course_id>/assignments/<int:assn_id>",
         views.get_assignments, name="getassignment"),
    path("course/<int:course_id>/assignments/<int:assn_id>/attachment",
         views.get_attachment, name="getattachment"),
    path("course/<int:course_id>/assignments/<int:assn_id>/submit",
         views.submit_assignment, name="submitassignment"),
]
