"use client"

import Modal from "@/components/Modal"
import { createContext, useContext, useState } from "react"

const ModalContext = createContext<{
	createModal: (children: React.ReactNode, width?: number, height?: number) => void,
	clearModal: () => void,
}>({
	createModal: (children: React.ReactNode, width?: number, height?: number) => {},
	clearModal: () => {},
})

export function useModal() {
	return useContext(ModalContext)
}

export function ModalProvider({
	children,
}: {
	children: React.ReactNode,
}): React.JSX.Element {
	const [modal, setModal] = useState<React.JSX.Element>()

	const createModal = (children: React.ReactNode, width?: number, height?: number) => {
		setModal(<Modal closeModal={clearModal} width={width} height={height}>{children}</Modal>)
	}

	const clearModal = () => {
		setModal(undefined)
	}

	return (
		<ModalContext.Provider value={{ createModal, clearModal }}>
			{modal}
			{children}
		</ModalContext.Provider>
	)
}
