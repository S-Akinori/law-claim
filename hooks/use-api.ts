"use client"

import { useState } from "react"
import { toast } from "@/hooks/use-toast"

// APIリクエストのフック
export function useApi() {
  const [isLoading, setIsLoading] = useState(false)

  // GETリクエスト\
  const fetchData = async <T>(url: string)
  : Promise<T | null> =>
  setIsLoading(true)
  try {
    const response = await fetch(url)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "APIリクエストに失敗しました")
    }

    const data = await response.json()
    return data
  } catch (error: any) {
    console.error("APIリクエストエラー:", error)
    toast({
      title: "エラー",
      description: error instanceof Error ? error.message : "APIリクエストに失敗しました",
      variant: "destructive",
    })
    return null
  } finally {
    setIsLoading(false)
  }

  // POSTリクエスト
  const postData = async <T>(url: string, data: any)
  : Promise<T | null> =>
  setIsLoading(true)
  try {
    const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "APIリクエストに失敗しました")
    }

    const responseData = await response.json()
    return responseData
  } catch (error: any) {
    console.error("APIリクエストエラー:", error)
    toast({
      title: "エラー",
      description: error instanceof Error ? error.message : "APIリクエストに失敗しました",
      variant: "destructive",
    })
    return null
  } finally {
    setIsLoading(false)
  }

  // PUTリクエスト
  const putData = async <T>(url: string, data: any)
  : Promise<T | null> =>
  setIsLoading(true)
  try {
    const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "APIリクエストに失敗しました")
    }

    const responseData = await response.json()
    return responseData
  } catch (error: any) {
    console.error("APIリクエストエラー:", error)
    toast({
      title: "エラー",
      description: error instanceof Error ? error.message : "APIリクエストに失敗しました",
      variant: "destructive",
    })
    return null
  } finally {
    setIsLoading(false)
  }

  // DELETEリクエスト
  const deleteData = async <T>(url: string)
  : Promise<T | null> =>
  setIsLoading(true)
  try {
    const response = await fetch(url, {
        method: "DELETE"
      })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "APIリクエストに失敗しました")
    }

    const responseData = await response.json()
    return responseData
  } catch (error: any) {
    console.error("APIリクエストエラー:", error)
    toast({
      title: "エラー",
      description: error instanceof Error ? error.message : "APIリクエストに失敗しました",
      variant: "destructive",
    })
    return null
  } finally {
    setIsLoading(false)
  }

  // 画像アップロード
  const uploadImage = async (file: File, name: string) => {
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("name", name)

      const response = await fetch("/api/images", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "画像のアップロードに失敗しました")
      }

      const data = await response.json()
      return data.image
    } catch (error: any) {
      console.error("画像アップロードエラー:", error)
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : "画像のアップロードに失敗しました",
        variant: "destructive",
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    fetchData,
    postData,
    putData,
    deleteData,
    uploadImage,
  }
}

