const express = require('express');
const userRouter = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config')
const {check, validationResult} = require('express-validator');
const auth = require('../../middleware/auth');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const User = require('../../models/User');
const Session = require('../../models/Session');
const Tutoring = require('../../models/Tutoring');

const storage = multer.diskStorage({
    destination: path.join(__dirname, '../../public/images'),
    filename:(req, file, callback) => {
        callback(null,req.user.id+'.'+file.mimetype.split('/')[1])
    }
})

const uploadMiddleware = multer({
    storage,
    fileFilter: (req,file, callback) => {
        const filetypes = ['.jpg','.png','.jpeg']
        const extname = path.extname(file.originalname);
        console.log(extname);
        if(filetypes.includes(extname)) return callback(null, true);
        callback('File must be a valid image type');
    }
}).single('image')

userRouter.get('/emails', async(req, res) => {
    try {
        const mails = [];
        const gottenMails = await User.find().select('email -_id');
        gottenMails.forEach((mail) => mails.push(mail.email));
        res.json(mails)
        

    } catch (err) {
        console.log(err);
    }
})

userRouter.post('/', [
    check('name','name is required').not().isEmpty(),
    check('email', 'please, include a valid email').isEmail(),
    check('password', 'please, enter a passward that is at least 6 characters long').isLength({min: 6}),
    check('birthdate', 'birthdate is required').not().isEmpty()
    ],
     async (req, res) => {

        //https://api.mapbox.com/geocoding/v5/mapbox.places/Los%20Angeles.json?access_token=YOUR_MAPBOX_ACCESS_TOKEN
        //access token: pk.eyJ1Ijoic2FtdWVsY29yb25hZG8iLCJhIjoiY2p4MjZiMzAwMDR2djQzcHlyNWs2MXNjdiJ9.wbogdv9262vjvpvif6mvIQ

        try {
            
            const errors = validationResult(req);
            if(!errors.isEmpty()) return res.status(400).json({errors: errors.array()});
    
            const {name, email, password, city, state, birthdate} = req.body
            console.log(state);
            
    
            //See if the user exists
            const userExists = await User.findOne({email});
            if(userExists) return res.status(400).json({errors:[{message: 'User already exists'}]});

            const user = new User({
                name,
                email,
                password,
                city,
                state,
                birthdate
            });

            if(((new Date(Date.now()).getUTCFullYear()) - new Date(birthdate).getFullYear()) < 5){
                return res.status(400).json({
                  errors: [{
                    msg: 'Minimum age is 5'
                  }]
                })
              }
            
            //Encrypt password

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            await user.save();

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
    
            //Return jsonwebtoken

        } catch (err) {
            
            console.error(err.message);
            res.status(500).send('Internal server error')
        }
      
    }
)

userRouter.post('/image-upload',auth, uploadMiddleware, async(req, res) => {

   try {
       const imageName = await User.findByIdAndUpdate({_id:req.user.id},{profileImage: req.file.filename},{new: true, useFindAndModify:false}).select('profileImage -_id');
       res.status(200).send(imageName)
   } catch (err) {
       console.log(err);
       
   }
   
    
})

userRouter.get('/:userId', async(req, res) => {

    try {
        const user = await User.findById(req.params.userId).populate('opinions.user','name -_id').select('-password');
        res.json(user)
        
    } catch (err) {
        console.log(err);      
    }


})

userRouter.put('/studies', auth, async(req, res) => {
    //const {institute, period, signature, description} = req.body;
    const newStudy = {
        institute,
        period,
        signature,
        description  
    } = req.body

    try {
        
     const updateUser = await User.findOneAndUpdate({_id:req.user.id}, {$push:{studies:newStudy}},{new: true, useFindAndModify:false}).select('studies -_id');
    res.status(200).json(updateUser); 
        
    } catch (err) {
        console.error(err);
    }
});


userRouter.delete('/studies/:studyId', auth, async(req, res) => {

    try {
    
        const updateUser = await User.findByIdAndUpdate({_id: req.user.id}, {$pull:{studies:{_id:req.params.studyId}}},{new: true, useFindAndModify:false}).select('studies -_id');
        res.status(200).json(updateUser);

    } catch (err) {
        console.error(err);
    }
    

});

userRouter.put('/about', auth, async(req, res) => {
    try {

        const updateUser = await User.findByIdAndUpdate({_id: req.user.id},{about:req.body.about},{new: true, useFindAndModify: false}).select('about -_id');
        res.status(200).json(updateUser);
        
    } catch (err) {
        console.error(err);
    }
});

userRouter.put('/updateSessions', auth, async(req, res) => {
    try {
        
        let sessionsToSend = [];
        const sessions = await Session.find({$or:[{tutor: req.user.id}, {student: req.user.id}], status: 'active'});
        sessions.forEach( async(session) => {
            const now = new Date(Date.now());
            if(now > session.date){
                session.status = 'finished';
                await session.save();
                sessionsToSend.push(session);
            }
        });

        if(sessionsToSend.length === 0){
            res.status(200);
            return;
        }
        res.status(200).send(sessionsToSend);

    } catch (err) {
        console.log(err);
    }
})

userRouter.post('/:userId/opinionsAsTutor', auth, async(req, res) => {

    try {

        const opinions = await User.findById(req.body.tutor).select('opinionsAsTutor -_id');
        console.log(opinions);
        if(opinions.opinionsAsTutor.includes(req.body.session)) throw new Error('Session was already rated')
        
        const student = mongoose.Types.ObjectId(req.user.id);
        const tutorId = mongoose.Types.ObjectId(req.body.tutor);
        const {opinion, rating} = req.body
        const studentName = await User.findById(req.user.id).select('name -_id')

        const newOpinion = {
            student,
            studentName: studentName.name,
            profileImage: req.body.profileImage,
            session: mongoose.Types.ObjectId(req.body.session),
            sessionName: req.body.sessionName,
            opinion,
            rating
        }

         await User.findByIdAndUpdate(tutorId,{$push:{opinionsAsTutor:newOpinion}},{new: true, useFindAndModify: false}).exec()
         await Session.findByIdAndUpdate({_id: req.body.session},{ratedByStudent: true},{new: true, useFindAndModify: false}).exec()
        
        const updatedSessions = await Session.find({student, ratedByStudent:false}); //Sessions that haven't been given
        const takenSessions = await Session.find({student, ratedByStudent: true}); //Sessions that already were given an rated 
        res.status(200).json({updatedSessions, takenSessions});

    } catch (err) {
        console.error(err);
    }
});

userRouter.post('/:userId/opinionsAsStudent', auth, async(req, res) => {

    try {

        const opinions = await User.findById(req.body.student).select('opinionsAsStudent -_id');
        if(opinions.opinionsAsStudent.includes(req.body.session)) throw new Error('Session was already rated')
        const tutor = mongoose.Types.ObjectId(req.user.id);
        const studentId = mongoose.Types.ObjectId(req.body.student);
        const {opinion, rating} = req.body
        const tutorName = await User.findById(req.user.id).select('name -_id');
        
        const newOpinion = {
            tutor,
            tutorName: tutorName.name,
            profileImage: req.body.profileImage,
            session: mongoose.Types.ObjectId(req.body.session),
            sessionName: req.body.sessionName,
            opinion,
            rating
        }
        
        await User.findByIdAndUpdate(studentId, {$push:{opinionsAsStudent: newOpinion}},{new:true, useFindAndModify: false}).exec()
        await Session.findByIdAndUpdate({_id: req.body.session}, {ratedByTutor: true}, {new: true, useFindAndModify: false}).exec()
        
        const updatedSessions = await Session.find({tutor, ratedByTutor: false}); //Sessions that haven't been given
        const givenSessions = await Session.find({tutor, ratedByTutor: true}); //Sessions that already were given an rated 
        res.status(200).json({updatedSessions, givenSessions});

    } catch (err) {
        console.error(err);
    }
})

userRouter.get('/:userId/sessions', auth, async(req, res) => {
    try {

        const userSessions = await Session.find({student: req.user.id, status: 'active'})
        res.status(200).send(userSessions);

    } catch (err) {
        console.log(err);
    }
});

userRouter.get('/:userId/profileImage', async(req,res) => {
    try {
        
        const profileImage = await User.findById(req.params.userId).select('profileImage -_id');
        res.send(profileImage);

    } catch (err) {
        console.log(err);
    }
})


module.exports = userRouter