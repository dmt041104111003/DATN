"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Icon } from "@/components/ui/icon"
import { DeleteDialog } from "@/components/dashboard/delete-dialog"
import type { Agent } from "@/types"

interface AgentListProps {
  agents: Agent[]
  onDelete: (id: string) => void
  onToggleActive: (id: string, isActive: boolean) => void
}

export function AgentList({ agents, onDelete, onToggleActive }: AgentListProps) {
  const truncateAddress = (addr: string) => {
    if (addr.length <= 20) return addr
    return `${addr.slice(0, 10)}...${addr.slice(-8)}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">All Agents ({agents.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="hidden sm:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Wallet Address</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>On-chain</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell className="font-mono text-xs">{agent.id.slice(-8)}</TableCell>
                  <TableCell className="font-medium">{agent.name}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {truncateAddress(agent.address)}
                  </TableCell>
                  <TableCell>{agent.location || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={agent.isActive ? "default" : "secondary"}>
                      {agent.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {agent.addAgentTxHash ? (
                      <Badge variant="outline" className="text-green-600">
                        Registered
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-yellow-600">
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onToggleActive(agent.id, agent.isActive)}
                        title={agent.isActive ? "Deactivate" : "Activate"}
                      >
                        <Icon 
                          name={agent.isActive ? "toggle_on" : "toggle_off"} 
                          size="sm" 
                          className={agent.isActive ? "text-green-600" : "text-muted-foreground"}
                        />
                      </Button>
                      <DeleteDialog
                        itemName={agent.name}
                        itemType="agent"
                        onDelete={() => onDelete(agent.id)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="sm:hidden space-y-3">
          {agents.map((agent) => (
            <div key={agent.id} className="border rounded-md p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">#{agent.id.slice(-8)}</span>
                    <Badge variant={agent.isActive ? "default" : "secondary"} className="text-xs">
                      {agent.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="font-medium mt-1">{agent.name}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-1">
                    {truncateAddress(agent.address)}
                  </p>
                  {agent.location && (
                    <p className="text-sm text-muted-foreground mt-1">{agent.location}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onToggleActive(agent.id, agent.isActive)}
                  >
                    <Icon 
                      name={agent.isActive ? "toggle_on" : "toggle_off"} 
                      size="sm" 
                      className={agent.isActive ? "text-green-600" : "text-muted-foreground"}
                    />
                  </Button>
                  <DeleteDialog
                    itemName={agent.name}
                    itemType="agent"
                    onDelete={() => onDelete(agent.id)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
