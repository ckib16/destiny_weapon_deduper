export interface WeaponInstance {
  itemInstanceId: string
  itemHash: number // Links to DestinyInventoryItemDefinition
  sockets: {
    sockets: SocketInstance[]
  }
}

export interface SocketInstance {
  plugHash: number // Currently equipped perk
  isEnabled: boolean
}
