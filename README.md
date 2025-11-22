# CPU-Scheduling-Visualization

A web-based interactive visualization tool for CPU scheduling algorithms.  
Developed as part of the PBL for Operating Systems (OSSP) course.

✅ Live demo: [Visit the app](https://cpu-scheduling-visualization-h4mt-fcfhinhi6.vercel.app/)  

---

## Table of Contents

- [Motivation](#motivation)  
- [Features](#features)  
- [Technologies](#technologies)  
- [Getting Started](#getting-started)  
  - [Prerequisites](#prerequisites)  
  - [Installation](#installation)  
  - [Running Locally](#running-locally)  
- [Usage](#usage)  
- [Project Structure](#project-structure)  
- [Contributing](#contributing)  
- [License](#license)  
- [Acknowledgements](#acknowledgements)

---

## Motivation

CPU scheduling is a key concept in operating systems and scheduling algorithms are essential for resource management and fairness. This project aims to help learners understand how different CPU scheduling algorithms work by providing an interactive, visual representation of:

- First-Come, First-Served (FCFS)  
- Shortest Job First (SJF)  
- Round Robin (RR)  
- Priority Scheduling  
- (and optionally other variants)  

By visualising processes, their arrival times, burst times, waiting times, turn-around times, and Gantt charts, the learner can see how scheduling decisions affect performance.

---

## Features

- Input table for processes: arrival time, burst time, priority (optional)  
- Selectable scheduling algorithm  
- Visualization of execution via Gantt chart  
- Computation and display of metrics: waiting time, turn-around time, average times  
- Responsive UI for desktop and mobile  
- Clean UI built with modern web stack  
- Easily extensible to add new scheduling algorithms  

---

## Technologies

This project is built using:

- **Frontend:** TypeScript
- **Styling:** Tailwind CSS 
- **Build & bundling:**  Next.js
- **Deployment:** Vercel 
- **Linting / Format:** ESLint, Prettier  


---

