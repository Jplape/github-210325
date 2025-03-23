import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function SupabaseTest() {
  const [message, setMessage] = useState('Testing connection...')

  useEffect(() => {
    const testConnection = async () => {
      try {
        const { data, error } = await supabase
          .from('test_table')
          .select('*')
          .limit(1)
        
        if (error) throw error
        
        setMessage('Connection successful!')
      } catch (error) {
        setMessage('Connection failed: ' + error.message)
      }
    }

    testConnection()
  }, [])

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <p>{message}</p>
    </div>
  )
}