import React, { useState, useCallback, useEffect } from 'react'
import { DndContext, DragEndEvent, UniqueIdentifier } from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Input, Button, InputGroup } from 'react-daisyui'
import { Drag, Minus, Plus } from '@icon-park/react'
import clsx from 'clsx'
import produce from 'immer'

function ChoiceListItem(props: {
  id: UniqueIdentifier
  disabled?: boolean
  value: string
  onChange: (id: UniqueIdentifier, text: string) => void
  onDelete?: (id: UniqueIdentifier) => void
  onAdd?: () => void
}) {
  const { id, disabled, value, onChange, onDelete, onAdd } = props

  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({ id, disabled })

  const [text, setText] = useState('')

  useEffect(() => {
    setText(value)
  }, [value])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setText(e.target.value)
    },
    [setText],
  )

  const handleBlur = useCallback(() => {
    onChange(id, text)
  }, [id, onChange, text])

  const handleDelete = useCallback(() => {
    onDelete?.(id)
  }, [id, onDelete])

  const handleAdd = useCallback(() => {
    handleBlur()
    onAdd?.()
  }, [handleBlur, onAdd])

  return (
    <div
      ref={setNodeRef}
      className="flex my-4"
      style={{
        opacity: isDragging ? 0.4 : undefined,
        transform: CSS.Translate.toString(transform),
        transition,
      }}
    >
      <InputGroup>
        <Button
          animation={false}
          className={clsx({
            'cursor-grab': true,
            'cursor-not-allowed': disabled,
            'active:cursor-grabbing': true,
          })}
          {...attributes}
          {...listeners}
          ref={setActivatorNodeRef}
        >
          <Drag className="p-0 bg-transparent" />
        </Button>
        <Input
          className="w-full placeholder:opacity-50"
          disabled={disabled}
          value={text}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </InputGroup>
      {onDelete && (
        <Button
          disabled={disabled}
          shape="circle"
          color="ghost"
          variant="outline"
          className="ml-3"
          onClick={handleDelete}
        >
          <Minus />
        </Button>
      )}
      {onAdd && (
        <Button
          disabled={disabled}
          shape="circle"
          color="success"
          className="ml-3"
          onClick={handleAdd}
        >
          <Plus />
        </Button>
      )}
    </div>
  )
}

export default function ChoiceList(props: {
  disabled?: boolean
  value: string[]
  onChange: (choices: string[]) => void
}) {
  const { onChange } = props

  const [value, setValue] = useState<{ id: UniqueIdentifier; text: string }[]>(
    [],
  )

  useEffect(() => {
    setValue(
      props.value.map((choice, index) => ({
        id: choice + index,
        text: choice,
      })),
    )
  }, [props.value])

  const handleChange = useCallback(
    (id: UniqueIdentifier, text: string) => {
      onChange(value.map((choice) => (choice.id === id ? text : choice.text)))
    },
    [onChange, value],
  )

  const handleDelete = useCallback(
    (id: UniqueIdentifier) => {
      onChange(
        produce(value, (draft) => {
          const targetIndex = draft.findIndex((choice) => choice.id === id)
          draft.splice(targetIndex, 1)
        }).map(({ text }) => text),
      )
    },
    [onChange, value],
  )

  const handleAdd = useCallback(() => {
    onChange([...value.map(({ text }) => text), ''])
  }, [onChange, value])

  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      const activeIndex = value.findIndex((choice) => choice.id === active.id)
      const overIndex = value.findIndex((choice) => choice.id === over?.id)
      onChange(arrayMove(value, activeIndex, overIndex).map(({ text }) => text))
    },
    [onChange, value],
  )

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <SortableContext items={value}>
        {value.map((choice, index) => (
          <ChoiceListItem
            key={choice.id}
            id={choice.id}
            disabled={props.disabled}
            value={choice.text}
            onChange={handleChange}
            onDelete={index < value.length - 1 ? handleDelete : undefined}
            onAdd={index === value.length - 1 ? handleAdd : undefined}
          />
        ))}
      </SortableContext>
    </DndContext>
  )
}
