"use client"

import { useAgents } from '@/hooks/useAgents'
import { LoadingPage } from '@/components/ui/loading'
import Image from 'next/image'
import { Form } from './form'
import { AgentTable } from './table'

export function List() {
  const {
    items: agents,
    loading,
    open,
    submitting,
    form,
    location,
    setLocation,
    setOpen,
    handleCreate,
    handleClose,
    onSubmit,
  } = useAgents()

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agents</h1>
          <p className="text-muted-foreground">Manage agent profiles</p>
        </div>
        <Form
          open={open}
          submitting={submitting}
          form={form}
          location={location}
          setLocation={setLocation}
          setOpen={setOpen}
          handleCreate={handleCreate}
          handleClose={handleClose}
          onSubmit={onSubmit}
        />
      </div>

      {loading ? (
        <LoadingPage />
      ) : agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Image
            src="/404.png"
            alt="404"
            height={500}
            width={750}
            className="mx-auto opacity-80"
          />
          <p className="-mt-2 text-xl text-muted-foreground">No agents found</p>
        </div>
      ) : (
        <AgentTable agents={agents} />
      )}
    </div>
  )
}

