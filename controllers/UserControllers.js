const UserModel = require("../models/UserModels");
const ValidateRegister = require("../validation/Register");
const ValidateLogin = require("../validation/Login");
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { Novu } = require('@novu/node');

// Register a user
const Register = async (req, res) => {
    const { errors, isValid } = ValidateRegister(req.body);
    try {
      if (!isValid) {
        res.status(404).json(errors);
      } else {
         const {email } = req.body;
        UserModel.findOne({ email }).then(async(exist) => {
          if (exist) {
            errors.email = "user already exist";
            res.status(404).json(errors);
          } else {
            const hash = bcrypt.hashSync(req.body.password, 10)//hashed password
            req.body.password = hash;
            
            const result =  await UserModel.create(req.body);
            const token = jwt.sign({ email: result.email, id: result._id }, process.env.PRIVATE_KEY, { expiresIn: "1h" })
            res.status(200).json({ result, token })
          }
    
        });
      }

    
      const novu = new Novu(process.env.NOVU_API_KEY);

      novu.trigger('signup-welcome', {
        to: {
          subscriberId: '63695b559e04bb11b56924df',
        },
        // payload: {
         
        // },
      });

    } catch (error) {
      res.status(404).json(error.message);
    }
  };
 

    // Login a user
 const Login = async (req, res)=> {
  const {errors, isValid} = ValidateLogin(req.body);
  try {
    if(!isValid){
      res.status(404).json(errors)
     }else{
      const { email, password } = req.body //Coming from formData
      const existingUser =  await UserModel.findOne({ email }) 
      if(!existingUser) return res.status(404).json({ message: "User doesn't exist" })
      const isPasswordCorrect  = await bcrypt.compare(password, existingUser.password)
      if(!isPasswordCorrect) return res.status(400).json({message: "Incorrect email or password"})
        //If crednetials are valid, create a token for the user
          const token = jwt.sign({  id: existingUser._id, name: existingUser.name ,email: existingUser.email, role: existingUser.role, avatar: existingUser.avatar}, process.env.PRIVATE_KEY,  { expiresIn: '24h' });
            //Then send the token to the client/frontend
             res.status(200).json({ result: existingUser, token })
     }
  } catch (error) {
    res.status(404).json(error.message);
  }
}

 module.exports = {
    Register,
    Login

  };