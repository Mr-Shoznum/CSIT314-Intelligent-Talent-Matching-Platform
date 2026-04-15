class Job 
{
    constructor(name, location, type, workFrom) 
    {
        this.name = name;
        this.location = location;
        this.type = type;
        this.workFrom = workFrom;
    }
}

const jobs = 
[
    new Job("Software Engineer", "Sydney", "Full-time", "Hybrid"),
    new Job("Mechanical Engineer", "Canberra", "Full-time", "In-person"),
    new Job("Teacher", "Melbourne", "Full-time", "In-person"),
    new Job("Shelf stocker", "Wollongong", "Part-time", "In-person"),
    new Job("Web designer", "Brisbane", "Full-time", "Remote"),
    new Job("Journalist", "Perth", "Full-time", "Remote")
];

function handleSearch() 
{
    const titleInput = document.querySelector("input").value.toLowerCase();
    const locationSelect = document.getElementById("locationSelect").value;
    const typeSelect = document.getElementById("typeSelect").value;
    const workFromSelect = document.getElementById("workFromSelect").value;

    const results = jobs.filter(job =>
        job.name.toLocaleLowerCase().includes(titleInput) &&
        job.location === locationSelect &&
        job.type === typeSelect &&
        job.workFrom === workFromSelect
    );

    displayResults(results);
}

function displayResults(results) 
{
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";

    if (results.length === 0) 
    {
        resultsDiv.innerHTML = `<p style="color: #667; font-style: italic;">No jobs match your filters.</p>`;
        return;
    }

    results.forEach(job => 
    {
        const div = document.createElement("div");
        div.style = "border: 1px solid #0857A9; padding: 15px; margin: 10px 0; border-radius: 8px;";
        div.innerHTML = `
            <h3 style="margin: 0 0 8px 0;">${job.name}</h3>
            <p><strong>Location:</strong> ${job.location}</p>
            <p><strong>Type:</strong> ${job.type}</p>
            <p><strong>Work from:</strong> ${job.workFrom}</p>
            `;
        resultsDiv.appendChild(div);
    });
}

document.addEventListener("DOMContentLoaded", () => 
{
    document.querySelector("button").addEventListener("click", handleSearch);
});