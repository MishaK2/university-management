enum StudentStatus {
    Active = "Active",
    Academic_Leave = "Academic_Leave",
    Graduated = "Graduated",
    Expelled = "Expelled"
}

enum CourseType {
    Mandatory = "Mandatory",
    Optional = "Optional",
    Special = "Special"
}

enum Semester {
    First = "First",
    Second = "Second"
}

enum GradeValue {
    Excellent = 5,
    Good = 4,
    Satisfactory = 3,
    Unsatisfactory = 2
}

enum Faculty {
    Computer_Science = "Computer_Science",
    Economics = "Economics",
    Law = "Law",
    Engineering = "Engineering"
}


interface Student {
    id: number;
    fullName: string;
    faculty: Faculty;
    year: number;
    status: StudentStatus;
    enrollmentDate: Date;
    groupNumber: string;
}

interface Course {
    id: number;
    name: string;
    type: CourseType;
    credits: number;
    semester: Semester;
    faculty: Faculty;
    maxStudents: number;
}

interface GradeRecord {
    studentId: number;
    courseId: number;
    grade: GradeValue;
    date: Date;
    semester: Semester;
}

class UniversityManagementSystem {
    private students: Student[] = [];
    private courses: Course[] = [];
    private grades: GradeRecord[] = [];
    private registrations: { studentId: number; courseId: number }[] = [];

    private studentIdCounter = 1;
    private courseIdCounter = 1;

    enrollStudent(student: Omit<Student, "id">): Student {
        const newStudent: Student = {
            id: this.studentIdCounter++,
            ...student,
        };
        this.students.push(newStudent);
        return newStudent;
    }

    addCourse(course: Omit<Course, "id">): Course {
        const newCourse: Course = {
            id: this.courseIdCounter++,
            ...course
        };
        this.courses.push(newCourse);
        return newCourse;
    }

    // Реєстрація студента на курс
    registerForCourse(studentId: number, courseId: number): void {
        const student = this.students.find(s => s.id === studentId);
        const course = this.courses.find(c => c.id === courseId);

        if (!student) throw new Error("Студента не знайдено");
        if (!course) throw new Error("Курс не знайдено");

        // Перевірка факультету
        if (student.faculty !== course.faculty) {
            throw new Error("Студент не може записатися на курс іншого факультету");
        }

        const registeredCount = this.registrations.filter(r => r.courseId === courseId).length;
        if (registeredCount >= course.maxStudents) {
            throw new Error("Досягнуто максимальну кількість студентів на курсі");
        }

        if (this.registrations.some(r => r.studentId === studentId && r.courseId === courseId)) {
            throw new Error("Студент вже зареєстрований на цей курс");
        }

        this.registrations.push({ studentId, courseId });
    }

    // Виставлення оцінки студенту
    setGrade(studentId: number, courseId: number, grade: GradeValue): void {
        const isRegistered = this.registrations.some(
            r => r.studentId === studentId && r.courseId === courseId
        );

        if (!isRegistered) {
            throw new Error("Студент не зареєстрований на курс — оцінку виставити неможливо");
        }

        const course = this.courses.find(c => c.id === courseId);
        if (!course) throw new Error("Курс не знайдено");

        this.grades.push({
            studentId,
            courseId,
            grade,
            date: new Date(),
            semester: course.semester,
        });
    }

    // Зміна статусу студента

    updateStudentStatus(studentId: number, newStatus: StudentStatus): void {
        const student = this.students.find(s => s.id === studentId);
        if (!student) throw new Error("Студента не знайдено");

        if (student.status === StudentStatus.Graduated || student.status === StudentStatus.Expelled) {
            throw new Error("Статус випускника або відрахованого змінювати не можна");
        }

        student.status = newStatus;
    }

    // Отримання студентів конкретного факультету

    getStudentsByFaculty(faculty: Faculty): Student[] {
        return this.students.filter(s => s.faculty === faculty);
    }

    // Отримання всіх оцінок студента
     
    getStudentGrades(studentId: number): GradeRecord[] {
        return this.grades.filter(g => g.studentId === studentId);
    }

    // Отримання доступних курсів за факультетом і семестром
    
    getAvailableCourses(faculty: Faculty, semester: Semester): Course[] {
        return this.courses.filter(
            c => c.faculty === faculty && c.semester === semester
        );
    }

    // Розрахунок середнього балу студента
     
    calculateAverageGrade(studentId: number): number {
        const studentGrades = this.getStudentGrades(studentId);

        if (studentGrades.length === 0) return 0;

        const total = studentGrades.reduce((sum, g) => sum + g.grade, 0);
        return total / studentGrades.length;
    }

    getExcellentStudentsByFaculty(faculty: Faculty): Student[] {
        return this.students
            .filter(s => s.faculty === faculty)
            .filter(s => this.calculateAverageGrade(s.id) >= 4.5);
    }
}

// Тести 

const ums = new UniversityManagementSystem();

// Курси
const c1 = ums.addCourse({
    name: "Algorithms",
    type: CourseType.Mandatory,
    credits: 5,
    semester: Semester.First,
    faculty: Faculty.Computer_Science,
    maxStudents: 2
});

// Cтуденти 
const s1 = ums.enrollStudent({
    fullName: "Ivan Ivanov",
    faculty: Faculty.Computer_Science,
    year: 1,
    status: StudentStatus.Active,
    enrollmentDate: new Date(),
    groupNumber: "CS-12"
});

// Реєстрація
ums.registerForCourse(s1.id, c1.id);

// Оцінки
ums.setGrade(s1.id, c1.id, GradeValue.Excellent);

console.log("Average:", ums.calculateAverageGrade(s1.id));
