import { Fragment, useEffect } from 'react'
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
} from 'react-hook-form'

import { BooleanSets } from '../src/schemas'
import Button from './basic/button'
import Select from './basic/select'

export default function BooleanSetsForm(props: {
  value?: BooleanSets
  onChange(value: BooleanSets): void
}) {
  const methods = useForm<BooleanSets>({
    defaultValues: {
      operator: 'or',
      operands: [
        { operator: 'and', operands: [{ function: '', arguments: [] }] },
      ],
    },
  })
  const { reset, handleSubmit, watch } = methods
  useEffect(() => {
    reset(props.value)
  }, [props.value, reset])

  return (
    <>
      <FormProvider {...methods}>
        <BooleanSetsAndBlock />
      </FormProvider>
      <Button primary onClick={handleSubmit(props.onChange, console.error)}>
        Confirm
      </Button>
      <pre>{JSON.stringify(watch(), null, 2)}</pre>
    </>
  )
}

function BooleanSetsAndBlock() {
  const { control } = useFormContext<BooleanSets>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'operands',
  })

  return (
    <>
      {fields.map((operand, index) => (
        <Fragment key={operand.operator + index}>
          <BooleanSetsOrBlock index={index} />
          <Button onClick={() => remove(index)}>-</Button>
        </Fragment>
      ))}
      <Button
        onClick={() =>
          append({
            operator: 'and',
            operands: [{ function: '', arguments: [] }],
          })
        }
      >
        Append Operator
      </Button>
    </>
  )
}

function BooleanSetsOrBlock(props: { index: number }) {
  const { control } = useFormContext<BooleanSets>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: `operands.${props.index}.operands`,
  })

  return (
    <>
      {fields.map((operand, index) => (
        <Fragment key={operand.function + index}>
          <BooleanUnitBlock i={props.index} index={index} />
          <Button onClick={() => remove(index)}>-</Button>
        </Fragment>
      ))}
      <Button onClick={() => append({ function: '', arguments: [] })}>
        Append Function
      </Button>
    </>
  )
}

function BooleanUnitBlock(props: { i: number; index: number }) {
  const { control } = useFormContext<BooleanSets>()

  return (
    <>
      <Controller
        control={control}
        name={`operands.${props.i}.operands.${props.index}.function`}
        render={({ field: { value, onChange } }) => (
          <Select
            options={['is_did', 'is_sub_did_of', 'owns_erc721']}
            value={value}
            onChange={onChange}
          />
        )}
      />
    </>
  )
}
