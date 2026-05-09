import React from 'react'
import { BsFileEarmarkText } from 'react-icons/bs'
import { GoPencil } from "react-icons/go";

export const NoteSymbol = () => {
  return (
    <div>
        <div className="position-relative d-inline-block">
            <BsFileEarmarkText className="text-success" style={{ fontSize: "24px" }} />
            <GoPencil className="position-absolute top-50 translate-middle-y text-success" style={{ fontSize: "14px", right: "-2px" }} />
        </div>
    </div>
  )
}
