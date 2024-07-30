console.log("Content script loaded.");

function addDropdowns() {
  console.log("Adding dropdowns...");

  const gradePoints = {
    "A+": 4.0,
    A: 4.0,
    "A-": 3.67,
    "B+": 3.33,
    B: 3.0,
    "B-": 2.67,
    "C+": 2.33,
    C: 2.0,
    "C-": 1.67,
    "D+": 1.33,
    D: 1.0,
    F: 0.0,
  };

  const semesters = getSemesterGradePoints();
  console.log(
    "Semesters with grade points before adding dropdowns:",
    semesters
  );

  document.querySelectorAll("tbody").forEach((tbody, sIndex) => {
    console.log(`Processing semester ${sIndex + 1}...`);

    tbody.querySelectorAll("tr").forEach((row, index) => {
      console.log(`Processing row ${index}...`);

      const gradeCell = row.cells[4]; // Assuming the 5th cell contains the grade
      const pointsCell = row.cells[5]; // Assuming the 6th cell contains the points

      if (gradeCell && pointsCell) {
        const currentGrade = gradeCell.textContent.trim();
        const gradePoint = pointsCell.textContent.trim();

        let select = gradeCell.querySelector("select");

        if (!select) {
          select = document.createElement("select");

          Object.keys(gradePoints).forEach((grade) => {
            const option = document.createElement("option");
            option.value = gradePoints[grade];
            option.textContent = grade;
            if (grade === currentGrade) {
              option.selected = true;
            }
            select.appendChild(option);
          });

          select.addEventListener("change", () => {
            gradeCell.textContent = select.options[select.selectedIndex].text;
            pointsCell.textContent = select.value;
            updatePoints(sIndex, index, parseFloat(select.value));
          });

          gradeCell.textContent = ""; // Clear the grade cell
          gradeCell.appendChild(select); // Append the select element
        }
      }
    });
  });

  // Initialize arrays to store CGPA and SGPA values
  let cgpaArray = [];
  let sgpaArray = [];

  // Get all elements with the 'pull-right' class
  let elements = document.querySelectorAll(".pull-right");

  elements.forEach((element, index) => {
    // Add 'semester' class to each element
    element.classList.add(`semester-${index + 1}`);

    // Extract text content of the element
    let textContent = element.textContent;

    // Use regular expressions to find CGPA and SGPA values (allowing for integers and floats)
    let cgpaMatch = textContent.match(/CGPA:(\d+(\.\d+)?)/);
    let sgpaMatch = textContent.match(/SGPA:(\d+(\.\d+)?)/);

    // If CGPA value is found, add it to the array
    if (cgpaMatch) {
      cgpaArray.push(parseFloat(cgpaMatch[1]));
    }

    // If SGPA value is found, add it to the array
    if (sgpaMatch) {
      sgpaArray.push(parseFloat(sgpaMatch[1]));
    }

    // Update the element's text content
    element.textContent = textContent;
  });

  console.log("CGPA Array:", cgpaArray);
  console.log("SGPA Array:", sgpaArray);
}

function getSemesterGradePoints() {
  const semesters = {};

  document.querySelectorAll("tbody").forEach((tbody, sIndex) => {
    const semesterKey = `semester${sIndex + 1}`;
    semesters[semesterKey] = [];

    tbody.querySelectorAll("tr").forEach((row) => {
      const pointsCell = row.cells[5]; // 6th cell contains the points
      const creditHoursCell = row.cells[3]; //4th cell contains the credit hours
      if (pointsCell && creditHoursCell) {
        const gradePoint = parseFloat(pointsCell.textContent.trim());
        const creditHours = parseFloat(creditHoursCell.textContent.trim());
        semesters[semesterKey].push({ gradePoint, creditHours });
      }
    });
  });

  return semesters;
}

function updatePoints(sIndex, rowIndex, newGradePoint) {
  console.log(`Updating points for semester ${sIndex + 1}, row ${rowIndex}...`);

  const semesters = getSemesterGradePoints();

  // Update the grade point in the semesters object
  const semesterKey = `semester${sIndex + 1}`;
  semesters[semesterKey][rowIndex].gradePoint = newGradePoint;

  // Recalculate SGPA for the semester
  const sgpa = calculateSGPA(semesters[semesterKey]);
  console.log(`Updated SGPA for semester ${sIndex + 1}: ${sgpa}`);

  // Update the SGPA in the DOM
  const sgpaElement = document.querySelector(`.semester-${sIndex + 1}`);
  if (sgpaElement) {
    sgpaElement.textContent = sgpaElement.textContent.replace(
      /SGPA:\d+(\.\d+)?/,
      `SGPA:${sgpa.toFixed(2)}`
    );
  }

  const cgpaArray = [];
  let totalCreditHours = 0;
  let totalGradePoints = 0;
  Object.keys(semesters).forEach((key, i) => {
    const semester = semesters[key];
    const semesterCreditHours = semester.reduce(
      (acc, course) => acc + course.creditHours,
      0
    );
    const semesterGradePoints = semester.reduce(
      (acc, course) => acc + course.gradePoint * course.creditHours,
      0
    );
    totalCreditHours += semesterCreditHours;
    totalGradePoints += semesterGradePoints;
    const cgpa = totalGradePoints / totalCreditHours;
    cgpaArray.push(cgpa);
  });

  cgpaArray.forEach((cgpa, i) => {
    const cgpaElement = document.querySelector(`.semester-${i + 1}`);
    if (cgpaElement) {
      cgpaElement.textContent = cgpaElement.textContent.replace(
        /CGPA:\d+(\.\d+)?/,
        `CGPA:${cgpa.toFixed(2)}`
      );
    }
  });

  console.log("CGPA Array after update:", cgpaArray);
}

function calculateSGPA(semester) {
  const totalPoints = semester.reduce(
    (acc, course) => acc + course.gradePoint * course.creditHours,
    0
  );
  const totalCreditHours = semester.reduce(
    (acc, course) => acc + course.creditHours,
    0
  );
  return totalPoints / totalCreditHours;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received:", request.action);
  if (request.action === "addDropdowns") {
    addDropdowns();
    sendResponse({ result: "Dropdowns added" });
  }
});
