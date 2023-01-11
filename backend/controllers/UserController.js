const User = require("../models/User")
const bcrypt = require("bcrypt")
const createUserToken = require("../helpers/create-user-token")

module.exports = class UserController {

    static async register(req, res) {

        const name = req.body.name
        const email = req.body.email
        const phone = req.body.phone
        const password = req.body.password
        const confirmpassword = req.body.confirmpassword


        if (!name) {
            res.status(422).json({ message: "O nome é obrigatório" })
            return
        }
        if (!email) {
            res.status(422).json({ message: "O email é obrigatório" })
            return
        }
        if (!phone) {
            res.status(422).json({ message: "O phone é obrigatório" })
            return
        }
        if (!password) {
            res.status(422).json({ message: "O password é obrigatório" })
            return
        }
        if (!confirmpassword) {
            res.status(422).json({ message: "O confirmpassword é obrigatório" })
            return
        }

        if (password !== confirmpassword) {
            res.status(422).json({ message: "A senha e a confirmação têm que ser iguais" })
            return
        }


        const userExists = await User.findOne({ email: email })

        if (userExists) {
            res.status(422).json({ message: "E-mail já cadastrado" })
            return
        }


        const salt = await bcrypt.genSalt(12)
        const passwordHash = await bcrypt.hash(password, salt)


        const user = new User({
            name: name,
            email: email,
            phone: phone,
            password: passwordHash
        })

        try {

            const newUser = await user.save()
            await createUserToken(newUser, req, res)

        } catch (error) {
            res.status(500).json({ message: error })
        }





    }

}