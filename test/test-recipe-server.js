const chai = require('chai');
const chaiHTTP = require('chai-http');

const {app, runServer, closeServer} = require('../server');

const expect = chai.expect;

chai.use(chaiHTTP);

describe('Recipes', function(){

	before(function(){
		return runServer();
	});

	after(function(){
		return closeServer();
	});

	it('should list items on GET', function(){
		return chai.request(app)
			.get('/recipes')
			.then(function(res){
				expect(res).to.have.status(200);
				expect(res).to.be.json;
				expect(res.body).to.be.a('array');
				expect(res.body.length).to.be.at.least(1);

				const expectedKeys = ['name', 'id', 'ingredients'];
				res.body.forEach(function(item){
					expect(item).to.be.a('object');
					expect(item).to.include.keys(expectedKeys);
				});
			})
	});

	it('should add an item on POST', function(){
		const testItem = {name: "chocolate milkshake", ingredients: ["milk", "chocolate"]}
		return chai.request(app)
			.post('/recipes')
			.send(testItem)
			.then(function(res){
				expect(res).to.have.status(201);
				expect(res).to.be.json;
				expect(res.body).to.be.a('object');
				expect(res.body).to.include.keys('name', 'id', 'ingredients');
				expect(res.body.id).to.not.equal(null);

				expect(res.body).to.deep.equal(Object.assign(testItem, {id: res.body.id}));
			})
	});

	it('should update an item on PUT', function(){
		const updateData = {
			name: "cookie",
			ingredients: ['sugar', 'flour', 'chocolate']
		};

		return chai.request(app)
			.get('/recipes')
			.then(function(res){
				updateData.id = res.body[0].id;
				return chai.request(app)
					.put(`/recipes/${updateData.id}`)
					.send(updateData);
			})
			.then(function(res){
				expect(res).to.have.status(204);
			})
	});

	it('should delete an item on DELETE', function(){
		return chai.request(app)
			.get('/recipes')
			.then(function(res){
				return chai.request(app)
					.delete(`/recipes/${res.body[0].id}`);
			})
			.then(function(res){
				expect(res).to.have.status(204);
			})
	});
});