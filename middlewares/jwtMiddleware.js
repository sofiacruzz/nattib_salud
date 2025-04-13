import jwt from  'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config();

export const verifyToken = (req, res, next) =>{
    
    let token = req.headers.authorization

    if(!token){
        return res.status(401).json({
            error: "No autenticado"
        });
    }

    token = token.split(" ")[1]

    try {
        const {medico_id, email} = jwt.verify(token, process.env.SECRET_KEY)
        req.email = email
        req.medico_id = medico_id
        next()
    } catch (error) {
        //console.log(error)
        return res.status(400).json({error: "token invalido"})
    }

}