"use client"

import React from "react"

import { useState, useEffect } from "react"

import "@/styles/components/Modal.css"

function Modal({
	closeModal,
	width,
	height,
	children,
}: {
	closeModal: () => void,
	width?: number,
	height?: number,
	children: React.ReactNode,
}): React.JSX.Element {

	const [isVisible, setIsVisible] = useState(false)

	useEffect(() => {
		setIsVisible(true)
	}, [])

	const handleCloseModal = () => {

		setIsVisible(false)
		setTimeout(() => {
			closeModal()
		}, 200)
	}

	return (
		<div
			className={`modal-transition ${isVisible ? "modal-appear" : "modal-disappear" }`}
			onClick={handleCloseModal}
		>
			<div
				className={`modal-intern ${isVisible ? "modal-pop-up" : "modal-pop-down" } overflow-scroll-y`}
				style={{ height, width }}
				onClick={(e) => e.stopPropagation()}
			>
				<button
					onClick={handleCloseModal}
					type="button"
					className="btn-close shadow-none modal-cross"
					aria-label="Close"
				>
				</button>
				{children}
			</div>
		</div>
	)

}

export default Modal
