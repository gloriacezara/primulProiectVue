import express from 'express';
import bodyParser from 'body-parser'

const app = express();

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)

const results = ['succeded', 'failed'];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.get('/api/v1/test', (req, res) => {
    res.status(200).send({
        response: results[Math.floor(Math.random() * results.length)],
        value: [results[Math.floor(Math.random() * results.length)], results[Math.floor(Math.random() * results.length)], results[Math.floor(Math.random() * results.length)]],
    })
});
app.get('/api/v1/products', (req, res) => {
    res.status(200).send({
        success: 'true',
        message: 'Products received successfully',
        todos: db.get('posts').value()
    })
});

app.post('/api/v1/login', (req, res) => {
    if (!req.body.username) {
        return res.status(400).send({
            success: 'false',
            message: 'Username is required'
        });
    } else if (!req.body.password) {
        return res.status(400).send({
            success: 'false',
            message: 'Password is required'
        })
    }
    let users = db.get('users').value();

    let validUser = users.filter(res => {
       return res.username === req.body.username && res.password === req.body.password
    })
    if(validUser.length){
        return res.status(200).send({
            success: 'true',
            message: 'Logged in successfully',
            token: '29932939232'
        })
    }else{
        return res.status(200).send({
            success: 'false',
            message: 'No such user'
        })
    }

});

app.post('/api/v1/register', (req, res) => {
    if (!req.body.username) {
        return res.status(400).send({
            success: 'false',
            message: 'Username is required'
        });
    } else if (!req.body.password) {
        return res.status(400).send({
            success: 'false',
            message: 'Password is required'
        })
    }
    let users = db.get('users').value();

    let validUser = users.filter(res => {
       return res.username === req.body.username
    });

    if(!validUser.length){
        db.get('users').push(req.body).write()
        return res.status(201).send({
            success: 'true',
            message: 'Registered successfully',
            token: '29932939232'
        })
    }else{
        return res.status(200).send({
            success: 'false',
            message: 'This user already exists'
        })
    }

});

app.post('/api/v1/products', (req, res) => {
    if (!req.body.title) {
        return res.status(400).send({
            success: 'false',
            message: 'Title is required'
        });
    } else if (!req.body.description) {
        return res.status(400).send({
            success: 'false',
            message: 'Description is required'
        });
    } else if (!req.body.price) {
        return res.status(400).send({
            success: 'false',
            message: 'Price is required'
        });
    }
    const products = db.get('posts').value()
    const todo = {
        id: products.length ? products[products.length - 1].id + 1 : 1,
        title: req.body.title,
        description: req.body.description,
        price: req.body.price
    }
    db.get('posts').push(todo).write()
    return res.status(201).send({
        success: 'true',
        message: 'Product added successfully',
        todo
    })
});

app.get('/api/v1/products/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    db.get('posts').value().map((product) => {
        if (product.id === id) {
            return res.status(200).send({
                success: 'true',
                message: 'Product retrieved successfully',
                product,
            });
        }
    });
    return res.status(404).send({
        success: 'false',
        message: 'Product does not exist',
    });
});

app.delete('/api/v1/products/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);

    db.get('posts').value().map((product, index) => {
        if (product.id === id) {
            db.get('posts').splice(index, 1).write();
            return res.status(200).send({
                success: 'true',
                message: 'Product deleted successfuly',
            });
        }
    });


    return res.status(404).send({
        success: 'false',
        message: 'Product not found',
    });


});

app.put('/api/v1/products/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    let productFound;
    let itemIndex;
    db.get('posts').value().map((product, index) => {
        if (product.id === id) {
            productFound = {title: product.title, description: product.description, price: product.price, id: id};
            itemIndex = index;
        }
    });

    if (!productFound) {
        return res.status(404).send({
            success: 'false',
            message: 'Product not found',
        });
    }

    if (!req.body.title) {
        return res.status(400).send({
            success: 'false',
            message: 'title is required',
        });
    } else if (!req.body.description) {
        return res.status(400).send({
            success: 'false',
            message: 'description is required',
        });
    } else if (!req.body.price) {
        return res.status(400).send({
            success: 'false',
            message: 'price is required',
        });
    }

    const updatedTodo = {
        id: productFound.id,
        title: req.body.title || productFound.title,
        description: req.body.description || productFound.description,
        price: req.body.price || productFound.price,
    };

    db.get('posts').splice(itemIndex, 1, updatedTodo).write();

    return res.status(201).send({
        success: 'true',
        message: 'Product added successfully',
        updatedTodo,
    });
});


const PORT = 5000;

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
});