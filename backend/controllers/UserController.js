const User = require("../models/User")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

//helpers
const createUserToken = require("../helpers/create-user-token")
const getToken = require("../helpers/get-token")
const getUserByToken = require("../helpers/get-user-by-token");


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

    static async login(req, res) {

        const email = req.body.email;
        const password = req.body.password;

        if (!email) {
            res.status(422).json({ message: "O email é obrigatório" })
            return
        }
        if (!password) {
            res.status(422).json({ message: "O password é obrigatório" })
            return
        }

        const user = await User.findOne({ email: email })

        if (!user) {
            res.status(422).json({ message: "Usuário não encontrado" })
            return
        }

        const checkPassword = await bcrypt.compare(password, user.password)

        if (!checkPassword) {
            res.status(422).json({ message: "Senha inválida" })
            return
        }

        await await createUserToken(user, req, res);


    }

    static async checkUser(req, res) {

        let currentUser;

        if (req.headers.authorization) {

            const token = getToken(req);
            const decoded = jwt.verify(token, "nossosecret")

            currentUser = await User.findById(decoded.id);

            currentUser.password = undefined

        } else {
            currentUser = null;
        }

        res.status(200).send(currentUser)
    }

    static async getUserById(req, res) {

        const id = req.params.id;

        const user = await User.findById(id).select("-password");

        if (!user) {
            res.status(422).json({
                message: "User não encontrado"
            })
            return;
        }
        res.status(200).json({
            user
        })

    }

    static async editUser(req, res) {


        const id = req.params.id;
        const token = getToken(req);
        const user = await getUserByToken(token);
        const name = req.body.name;
        const email = req.body.email;
        const phone = req.body.phone;
        const password = req.body.password;
        const confirmpassword = req.body.confirmpassword;

        if (req.file) {
            user.image = req.file.filename;
        }

        if (!name) {
            res.status(422).json({ message: "O nome é obrigatório" })
            return
        }
        user.name = name;

        if (!email) {
            res.status(422).json({ message: "O email é obrigatório" })
            return
        }

        const userExists = await User.findOne({ email: email })

        if (user.email !== email && userExists) {
            res.status(422).json({ message: "Por favor, utilize outro e-mail" });
            return;
        }
        user.email = email;

        if (!phone) {
            res.status(422).json({ message: "O phone é obrigatório" })
            return
        }
        user.phone = phone;

        if (password != confirmpassword) {
            res.status(422).json({ message: "As senhas não conferem" });
            return;
        } else if (password === confirmpassword && password != null) {
            const salt = await bcrypt.genSalt(12);
            const passwordHash = await bcrypt.hash(password, salt);
            user.password = passwordHash;
        }

        res.status(200).json({ message: "User atualizado" });

        try {
            await User.findOneAndUpdate(
                { _id: user.id },
                { $set: user },
                { new: true }
            );

            res.status(200).json({ message: "Usuário atualizado com sucesso!" })
        } catch (error) {
            return;
        }


    }
}