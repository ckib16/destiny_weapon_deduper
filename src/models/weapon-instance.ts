export interface WeaponInstance {
  itemInstanceId: string
  itemHash: number // Links to DestinyInventoryItemDefinition
  sockets: {
    sockets: SocketInstance[]
  }
  socketPlugsByIndex?: Record<number, number[]>
}

export interface SocketInstance {
  plugHash: number // Currently equipped perk
  isEnabled: boolean
}
