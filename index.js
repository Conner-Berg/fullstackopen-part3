require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors");
const Person = require("./models/person");

app.use(express.json());
app.use(cors());
app.use(express.static("build"));

morgan.token("payload", (request) => {
	if (
		request.method === "POST" ||
		request.method === "PUT" ||
		request.method === "PATCH"
	) {
		return JSON.stringify(request.body);
	}
	return "";
});

app.use(
	morgan(
		":method :url :status :response-time ms - :res[content-length] :payload"
	)
);

app.get("/api/people", (request, response) => {
	Person.find({}).then((people) => {
		response.json(people);
	});
});

app.get("/api/people/:id", (request, response) => {
	const id = Number(request.params.id);
	const person = people.find((person) => person.id === id);

	if (person) {
		response.json(person);
	} else {
		response.status(404).end();
	}
});

app.post("/api/people", (request, response) => {
	const body = request.body;

	if (body.name === undefined) {
		return response.status(400).json({ error: "name missing" });
	}

	const person = new Person({
		name: body.name,
		number: body.number,
	});

	person.save().then((savedPerson) => {
		response.json(savedPerson);
	});
});

app.delete("/api/people/:id", (request, response) => {
	const id = Number(request.params.id);
	people = people.filter((person) => person.id !== id);

	response.status(204).end();
});

app.get("/info", (request, response) => {
	const date = new Date();
	response.send(
		`<p>Phonebook has info for ${people.length} people</p>
				<p>${date}</p>`
	);
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
