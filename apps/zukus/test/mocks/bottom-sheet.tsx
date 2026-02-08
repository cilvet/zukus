/**
 * Minimal @gorhom/bottom-sheet mock.
 */
import React from 'react'

const BottomSheet = React.forwardRef<any, any>(({ children }, ref) => {
  React.useImperativeHandle(ref, () => ({
    expand: () => {},
    collapse: () => {},
    close: () => {},
    snapToIndex: () => {},
  }))
  return <div ref={ref}>{children}</div>
})
BottomSheet.displayName = 'BottomSheet'

export default BottomSheet

export const BottomSheetModal = React.forwardRef<any, any>(({ children }, ref) => {
  React.useImperativeHandle(ref, () => ({
    present: () => {},
    dismiss: () => {},
    close: () => {},
    snapToIndex: () => {},
  }))
  return <div>{children}</div>
})
BottomSheetModal.displayName = 'BottomSheetModal'

export const BottomSheetModalProvider = ({ children }: any) => <>{children}</>
export const BottomSheetBackdrop = () => null
export const BottomSheetView = ({ children }: any) => <div>{children}</div>
export const BottomSheetScrollView = ({ children }: any) => <div>{children}</div>
export const BottomSheetFlatList = ({ children }: any) => <div>{children}</div>

export function useBottomSheet() {
  return { expand: () => {}, collapse: () => {}, close: () => {}, snapToIndex: () => {} }
}

export function useBottomSheetModal() {
  return { present: () => {}, dismiss: () => {} }
}
