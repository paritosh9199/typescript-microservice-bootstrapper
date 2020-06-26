import { Schema, model } from "mongoose"
import validator from "validator"
import jwt from "jsonwebtoken"
import _ from "lodash"
import bcrypt from "bcryptjs"
import { v4 as uuid } from "uuid"

// eslint-disable-next-line no-unused-vars
import { IUser, IUserDocument, IUserModel } from "../../interfaces/databaseinterface"

const UserSchema: Schema = new Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: "{VALUE} is not a valid email"
        }
    },
    password: {
        type: String,
        require: true,
        minlength: 6
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
})

UserSchema.methods.toJSON = function () {
    let user = this
    let userObject = user.toObject()

    return _.pick(userObject, ["_id", "email"])
}

UserSchema.methods.generateAuthToken = function () {
    let user = this
    let access = "auth"
    let token = uuid()
    // let token = jwt.sign({ _id: user._id.toHexString(), access }, process.env.JWT_SECRET!).toString()
    let signed_token = jwt.sign({ _id: user._id.toHexString(), token: token, access }, process.env.JWT_SECRET!).toString()

    user.tokens.push({ access, token })

    return user.save().then(() => {
        return signed_token
    })
}

UserSchema.statics.removeAuthToken = function (token: any) {
    let user = this

    let decoded: any = jwt.decode(token, { complete: true })


    if (decoded) {
        return user.update({
            $pull: {
                tokens: { token: decoded.token }
            }
        })
    }
}


UserSchema.statics.findByToken = function (token: any, access: string = "auth") {
    let User = this
    let decoded: any
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET! as string)
    } catch (e) {
        return Promise.reject()
    }
    // if (decoded && typeof decoded != undefined) {
    return User.findOne({
        "_id": decoded._id,
        "tokens.token": decoded.token,
        "tokens.access": access
    })
    // }
}

UserSchema.statics.findByCredentials = function (email: string, password: string) {
    let User = this

    return User.findOne({ email }).then((user: any) => {
        if (!user) {
            return Promise.reject()
        }

        return new Promise((resolve, reject) => {
            // Use bcrypt.compare to compare password and user.password
            bcrypt.compare(password, user.password, (err, res) => {
                if (res) {
                    resolve(user)
                } else {
                    reject()
                }
            })
        })
    })
}

UserSchema.statics.accountExists = function (email: string) {
    let User: IUserModel = this! as IUserModel

    return User.findOne({ email }).then((user: any) => {
        if (user) {
            return user
        } else {
            return false
        }
    })
}
UserSchema.pre("save", function (next) {
    let user: any = this

    if (user.isModified("password")) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash
                next()
            })
        })
    } else {
        next()
    }

})


export const User: IUserModel = model<IUser, IUserModel>("User", UserSchema)

export default User