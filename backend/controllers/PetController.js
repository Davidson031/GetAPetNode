
const getToken = require("../helpers/get-token");
const Pet = require("../models/Pet");
const getUserByToken = require("../helpers/get-user-by-token");

module.exports = class PetController {

    static async create(req, res) {

        const { name, age, weight, color } = req.body;
        const avaliable = true;
        const images = req.files;


        if (!name) {
            res.status(422).json({ message: "O Nome é obrigatório!" });
            return;
        }
        if (!age) {
            res.status(422).json({ message: "A idade é obrigatória!" });
            return;
        }
        if (!weight) {
            res.status(422).json({ message: "O Peso é obrigatório!" });
            return;
        }
        if (!color) {
            res.status(422).json({ message: "A Cor é obrigatória!" });
            return;
        }
        if (!images) {
            res.status(422).json({ message: "A Imagem é obrigatória!" });
            return;
        }

        //get pet owner
        const token = getToken(req);
        const user = await getUserByToken(token);

        const pet = new Pet({
            name,
            age,
            weight,
            color,
            avaliable,
            images: [],
            user: {
                _id: user._id,
                name: user.name,
                image: user.image,
                phone: user.phone
            }
        });


        images.map((img) => {
            pet.images.push(img.filename)
        });

        try {
            const newPet = await pet.save();
            res.status(201).json({ message: "Pet cadastrado com sucesso", newPet })
        } catch (error) {
            //res.status(500).json({ message: error })
        }

    }

    static async getAll(req, res){

        const pets = await Pet.find().sort("-createdAt")

        res.status(200).json({
            pets: pets
        })

    }

    static async getAllUserPets(req, res){

        const token = getToken(req);
        const user = await getUserByToken(token);
        const pets = await Pet.find({"user._id" : user._id});

        res.status(200).json({ pets: pets})


    }
}