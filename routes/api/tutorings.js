const express = require('express');
const tutoringRouter = express.Router();
const {check, validationResult} = require('express-validator');
const auth = require('../../middleware/auth');
const mongoose = require('mongoose');
const Tutoring = require('../../models/Tutoring');
const Session = require('../../models/Session');

tutoringRouter.post('/', auth, async(req, res) => {

    const userId = mongoose.Types.ObjectId(req.user.id);

    const {
        signature,
        price,
        tags,
        days,
        from,
        to,
        hours,
        description
    } = req.body.tutoringInfo

   console.log(tags);
   
  
    const tutoring =new Tutoring({
        tutor: userId,
        signature,
        price,
        tags,
        from,
        to,
        hours,
        days,
        description
    });
    
    console.log(tutoring);
    
    
    await tutoring.save();

    res.status(200).json(tutoring)
    

});

tutoringRouter.get('/:tutoringId', async(req, res) => {

    try {
        const tutoringDetails = await Tutoring.findById(req.params.tutoringId).populate('tutor','name _id')
        res.status(200).json(tutoringDetails);        
    } catch (err) {
        console.log(err);
        
    }

});

tutoringRouter.get('/:tutoringId/sessions', auth, async(req, res) => {
    try {
         
        const date = new Date(req.query.date).toDateString()
        console.log(date, '.v');
        const sessions = await Session.find({tutor: req.query.tutor, date: date}).select('hours location');
        console.log(sessions);
        
        
        res.status(200).send(sessions);

    } catch (err) {
        console.log(err);
        
    }
});

tutoringRouter.post('/:tutoringId/session', auth, async(req, res) => {

    req.body.tutoring = mongoose.Types.ObjectId(req.body.tutoring);
    req.body.student = mongoose.Types.ObjectId(req.body.student);
    req.body.tutor = mongoose.Types.ObjectId(req.body.tutor);
    
     try {
        const session =  new Session(req.body);
        await session.save();
        const sessions = await Session.find({student: req.body.student, ratedByStudent:false})
        console.log(sessions);
        res.status(200).send(sessions)
    } catch (error) {
        console.log(error);
    } 
})

tutoringRouter.get('/search/:term', async(req, res) => {

    const {term} = req.params
    console.log(term);
    const regex = new RegExp(`${term}`,'i')
    const tutorings = await Tutoring.find({
        $or:[{signature: regex}, {tags: regex}]
    });

    res.status(200).send(tutorings)
})

module.exports = tutoringRouter