const express = require('express');
const authRouter = express.Router();
const auth = require('../../middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const {check, validationResult} = require('express-validator');
const User = require('../../models/User');
const Tutoring = require('../../models/Tutoring');
const Session = require('../../models/Session');




authRouter.get('/', auth, async(req,res) => {
    try {
        
        const user = await User.findById(req.user.id).select('-password');
        const userTutorings = await Tutoring.find({tutor: user._id});
        
        //Update the following part of code so it will only execute a query 
        const sessions = {
            sessionsToTake: await Session.find({student: user._id, ratedByStudent: false}),
            sessionsToGive: await Session.find({tutor: user._id, ratedByTutor: false}),
            takenSessions = await Session.find({student: user._id, ratedByStudent: true }),
            givenSessions = await Session.find({student: user._id, ratedByTutor: true})

        }
        
        res.json({user, userTutorings, sessions});

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
});

authRouter.post(
    '/',
    [
        check('email', 'Email is not valid').isEmail(),
        check('password', 'Password is required').exists()
    ],
    async(req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) return res.status(400).json({errors:errors.array()});
        const {email, password} = req.body

        try {
            
            let user = await User.findOne({email});
            if(!user) return res.status(400).json({errors: [{message: 'Invalid credentials'}]});

            const passwordMatches = await bcrypt.compare(password, user.password);

            if(!passwordMatches) return res.status(400).json({errors: [{message: 'Invalid credentials'}]});

            const payload = {
                user:{
                    id: user.id
                }
            }

            jwt.sign(
                payload,
                config.get('jwtSecret'),
                {expiresIn: 360000},
                (err, token) => {
                    if(err) throw err;
                    res.json({token})
                }
            )

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error')
            
        } 
    }
)

module.exports = authRouter;