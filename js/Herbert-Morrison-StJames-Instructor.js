const subjectFilter      = document.getElementById('subjectFilter');
const gradeSection       = document.getElementById('gradeSection');
const metricsSection     = document.getElementById('metricsSection');
const currentSubjectName = document.getElementById('currentSubjectName');
const gradeTableBody     = document.querySelector('#gradeTable tbody');

// Pull registered students from localStorage (saved by admin registration form)
function getRegisteredStudents() {
    const data = localStorage.getItem("registeredStudents");
    return data ? JSON.parse(data) : [];
}

// Load saved grades for a subject from localStorage
function getSavedGrades(subjectKey) {
    const data = localStorage.getItem("grades_" + subjectKey);
    return data ? JSON.parse(data) : {};
}

// Save grades for a subject to localStorage
function saveGrades(subjectKey, grades) {
    localStorage.setItem("grades_" + subjectKey, JSON.stringify(grades));
}

// Handle subject selection
subjectFilter.addEventListener('change', function(e) {
    const selectedSubject = e.target.value;

    if (selectedSubject === "") {
        gradeSection.style.display  = 'none';
        metricsSection.style.display = 'none';
        return;
    }

    const selectedText = subjectFilter.options[subjectFilter.selectedIndex].text;
    currentSubjectName.textContent = selectedText;

    gradeSection.style.display   = 'block';
    metricsSection.style.display = 'block';

    loadGradeTable(selectedSubject);
});

function loadGradeTable(subjectKey) {
    gradeTableBody.innerHTML = "";

    const students   = getRegisteredStudents();
    const savedGrades = getSavedGrades(subjectKey);

    if (students.length === 0) {
        gradeTableBody.innerHTML = '<tr><td colspan="6">No students registered yet.</td></tr>';
        return;
    }

    students.forEach(function(student) {
        const id      = student.studentID;
        const name    = student.studentfName + " " + student.studentlName;
        const saved   = savedGrades[id] || { assignment: 0, midterm: 0, final: 0 };

        const row = document.createElement('tr');
        row.innerHTML =
            '<td>' + id + '</td>' +
            '<td>' + name + '</td>' +
            '<td><input type="number" min="0" max="100" value="' + saved.assignment + '" class="grade-input assignment-input" data-id="' + id + '"></td>' +
            '<td><input type="number" min="0" max="100" value="' + saved.midterm + '" class="grade-input midterm-input" data-id="' + id + '"></td>' +
            '<td><input type="number" min="0" max="100" value="' + saved.final + '" class="grade-input final-input" data-id="' + id + '"></td>' +
            '<td class="final-grade-display"><strong>0%</strong></td>';

        gradeTableBody.appendChild(row);
    });

    // Attach listeners and calculate initial grades
    var inputs = document.querySelectorAll('.grade-input');
    inputs.forEach(function(input) {
        input.addEventListener('input', function() {
            updateStudentGrade(subjectKey, this);
        });
        updateStudentGrade(subjectKey, input);
    });
}

function updateStudentGrade(subjectKey, inputElement) {
    const row        = inputElement.closest('tr');
    const id         = inputElement.getAttribute('data-id');
    const assignment = Number(row.querySelector('.assignment-input').value) || 0;
    const midterm    = Number(row.querySelector('.midterm-input').value)    || 0;
    const finalExam  = Number(row.querySelector('.final-input').value)      || 0;

    const finalGrade = (assignment * 0.30) + (midterm * 0.30) + (finalExam * 0.40);
    row.querySelector('.final-grade-display strong').textContent = finalGrade.toFixed(2) + '%';

    // Persist grades to localStorage
    const savedGrades  = getSavedGrades(subjectKey);
    savedGrades[id]    = { assignment: assignment, midterm: midterm, final: finalExam };
    saveGrades(subjectKey, savedGrades);

    calculateClassMetrics(subjectKey);
}

function calculateClassMetrics(subjectKey) {
    const rows = gradeTableBody.querySelectorAll('tr');
    if (rows.length === 0) return;

    var total     = 0;
    var highest   = 0;
    var passCount = 0;
    var count     = 0;

    rows.forEach(function(row) {
        const text = row.querySelector('.final-grade-display strong');
        if (!text) return;
        const score = parseFloat(text.textContent) || 0;
        total += score;
        if (score > highest) highest = score;
        if (score >= 50) passCount++;
        count++;
    });

    if (count === 0) return;

    document.getElementById('classAverage').textContent = (total / count).toFixed(2) + '%';
    document.getElementById('highestGrade').textContent = highest.toFixed(2) + '%';
    document.getElementById('passRate').textContent     = ((passCount / count) * 100).toFixed(2) + '%';
}
