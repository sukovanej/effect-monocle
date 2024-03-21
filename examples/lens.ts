import { Option } from "effect"
import { Lens } from "effect-monocle"

interface User {
  credentials: Credentials
  info: Info
}

interface Credentials {
  username: string
  passwordHash: string
}

interface Info {
  name: string
  email: Option.Option<string>
  address: Address
}

interface Address {
  street: string
  city: string
  zip: string
  state: Option.Option<string>
  houseNumber: Option.Option<string>
}

const userLens = Lens.id<User>()

const userAddressLens = Lens.prop(userLens, "info", "address")
const userStreetLens = Lens.prop(userAddressLens, "street")
const userUsernameLens = Lens.prop(userLens, "credentials", "username")

const user: User = {
  credentials: {
    username: "patrik",
    passwordHash: "hash"
  },
  info: {
    name: "Patrik",
    email: Option.some("dominik@pollo.com"),
    address: {
      street: "Kureci",
      city: "Brno",
      zip: "12345",
      state: Option.none(),
      houseNumber: Option.some("69")
    }
  }
}

console.log(`user ${userStreetLens.get(user)} lives at ${userUsernameLens.get(user)} street`)
