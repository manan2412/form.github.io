
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const { check, validationResult } = require('express-validator');

const mongoose = require('mongoose');
const { Double } = require('bson');
const { Decimal128 } = require('bson');
mongoose.connect('mongodb://localhost:27017/isp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
var myApp = express();
myApp.use(bodyParser.urlencoded({ extended: false }));

myApp.set('views', path.join(__dirname, 'views'));

myApp.use(express.static(__dirname + '/public'));
myApp.set('view engine', 'ejs');


myApp.get('/', function (req, res) {
    res.render('index');
});
myApp.get('/view', function (req, res) {
    Order.find({}).exec(function (err, Order) {
        console.log(Order);
        res.render('allOrders', {orders: Order}
        
        )
    })
});

var phoneRegex = /^[0-9]{3}\-[0-9]{3}\-[0-9]{4}$/;
var positiveNum = /^([1-9][0-9]*|[0]*)$/;
const plan1Rate = 35.99;
const plan2Rate = 85.99;
const plan3Rate = 200;
const discountMultiple = 0.2;
const taxMultiple = 0.13;
var plan1Price = 0;
var plan2Price = 0;
var plan3Price = 0;
var plan1Quantity = 0;
var plan2Quantity = 0;
var plan3Quantity = 0;
var subtotal = 0;
var total = 0;
var taxPrice = 0;

const Order = mongoose.model('Order', {
    name: String,
    phone: String,

    plan1Price: Decimal128, plan1Rate: Decimal128, plan1Quantity: Number,
    plan2Price: Decimal128, plan2Rate: Decimal128, plan2Quantity: Number,
    plan3Price: Decimal128, plan3Rate: Decimal128, plan3Quantity: Number,

    subTotal: Decimal128,
    taxPrice: Decimal128,
    total: Decimal128
});
function checkRegex(userInput, regex) {
    if (regex.test(userInput)) {
        return true;
    }
    else {
        return false;
    }
}

function customPhoneValidation(value) {
    if (!checkRegex(value, phoneRegex)) {
        throw new Error('Phone should be in the format xxx-xxx-xxxx');
    }
    return true;
}

function quantityPositve(value) {
    if (!checkRegex(value, positiveNum)) {
        throw new Error('Quantity is gonna be positive.')
    }
    return true;
}

myApp.post('/formSuccess', [
    check('name', 'Must have a name').not().isEmpty(),
    check('phone').custom(customPhoneValidation),

    check('plan1', "quantity 1 only in numbers").custom(quantityPositve),
    check('plan2', "quantity 2 only in numbers").custom(quantityPositve),
    check('plan3', "quantity 3 only in numbers").custom(quantityPositve),

], function (req, res) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        res.render('index', {
            errors: errors.array()
        });
    }
    else {


        plan1Quantity = parseInt(req.body.plan1);
        plan2Quantity = parseInt(req.body.plan2);
        plan3Quantity = parseInt(req.body.plan3);

        if (isNaN(req.body.plan1)) {
            plan1Quantity = 0;
        }
        if (isNaN(req.body.plan2)) {
            plan2Quantity = 0;
        } if (isNaN(req.body.plan3)) {
            plan3Quantity = 0;
        }

        var name = req.body.name;
        var phone = req.body.phone;

 

        plan1Price = plan1Quantity * plan1Rate;
        plan2Price = plan2Quantity * plan2Rate;
        plan3Price = plan3Quantity * plan3Rate;
        console.log(req.body);
        if (plan3Price != 0) {
            plan3Price = plan3Price * discountMultiple;

        }

        subTotal = plan3Price + plan1Price + plan2Price;
        taxPrice = subTotal * taxMultiple;
        total = subTotal + taxPrice;

        var pageData = {
            name: name,
            phone: phone,

            plan1Price: plan1Price, plan1Rate: plan1Rate, plan1Quantity: plan1Quantity,
            plan2Price: plan2Price, plan2Rate: plan2Rate, plan2Quantity: plan2Quantity,
            plan3Price: plan3Price, plan3Rate: plan3Rate, plan3Quantity: plan3Quantity,

            subTotal: subTotal,
            taxPrice: taxPrice,
            total: total
        }


        var myOrder = new Order(pageData);

        // save this order

        myOrder.save().then(() => {
            console.log('New order information saved in database');
        });

        res.render('bill', pageData);
    }
});
myApp.listen(8080);


console.log('!!!!!!!!!!!!!!!!Final Exam website started!!!!!!!!!!!!');


