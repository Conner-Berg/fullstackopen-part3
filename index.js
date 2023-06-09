require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors");
const Person = require("./models/person");

app.use(express.static("build"));
app.use(express.json());
app.use(cors());

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

app.get("/api/people", (request, response, next) => {
	Person.find({})
		.then((people) => {
			response.json(people);
		})
		.catch((error) => next(error));
});

app.get("/api/people/:id", (request, response, next) => {
	Person.findById(request.params.id)
		.then((person) => {
			if (person) {
				response.json(person);
			} else {
				response.status(404).end();
			}
		})
		.catch((error) => next(error));
});

app.post("/api/people", (request, response, next) => {
	const body = request.body;

	if (body.name === undefined) {
		return response.status(400).json({ error: "name missing" });
	}

	const person = new Person({
		name: body.name,
		number: body.number,
	});

	person
		.save()
		.then((savedPerson) => {
			response.json(savedPerson);
		})
		.catch((error) => next(error));
});

app.put("/api/people/:id", (request, response, next) => {
	const body = request.body;

	const person = {
		name: body.name,
		number: body.number,
	};

	Person.findByIdAndUpdate(request.params.id, person, { new: true })
		.then((updatedPerson) => {
			response.json(updatedPerson);
		})
		.catch((error) => next(error));
});

app.delete("/api/people/:id", (request, response, next) => {
	Person.findByIdAndRemove(request.params.id)
		.then(() => {
			response.status(204).end();
		})
		.catch((error) => next(error));
});

app.get("/info", (request, response, next) => {
	Person.find({})
		.then((people) => {
			response.send(
				`<p>Phonebook has info for ${
					people.length
				} people</p><p>${new Date()}</p>`
			);
		})
		.catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
	response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
	if (error.name === "CastError") {
		return response.status(400).send({ error: "malformatted id" });
	} else if (error.name === "ValidationError") {
		return response.status(400).json({ error: error.message });
	}

	next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
