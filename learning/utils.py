# from models import *


def get_path_assignment(model, filename):
    return f"files/courses/{model.course.id}/{filename}"


def get_path_submission(model, filename):
    return f"files/submissions/{model.course_id}/{filename}"
