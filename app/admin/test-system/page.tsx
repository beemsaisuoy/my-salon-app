
'use client';

import { useState } from 'react';

type TestStatus = 'IDLE' | 'RUNNING' | 'PASS' | 'FAIL' | 'WARNING';

interface TestResult {
    id: string;
    name: string;
    status: TestStatus;
    message: string;
}

export default function SystemTestPage() {
    const [loading, setLoading] = useState(false);
    const [lineTesting, setLineTesting] = useState(false);
    const [results, setResults] = useState<Record<string, TestResult>>({
        db: { id: 'db', name: 'Database Connection (Supabase)', status: 'IDLE', message: '-' },
        ai: { id: 'ai', name: 'AI Engine (Gemini API)', status: 'IDLE', message: '-' },
        qr: { id: 'qr', name: 'Payment QR Generator', status: 'IDLE', message: '-' },
        vector: { id: 'vector', name: 'Semantic Search (pgvector)', status: 'IDLE', message: '-' },
        line: { id: 'line', name: 'Line Notification', status: 'IDLE', message: '-' },
    });

    const runSystemTests = async () => {
        setLoading(true);
        // Reset statuses
        setResults(prev => Object.keys(prev).reduce((acc, key) => ({
            ...acc,
            [key]: { ...prev[key], status: 'RUNNING', message: 'Testing...' }
        }), {} as any));

        try {
            const res = await fetch('/api/system-test', {
                method: 'POST',
                body: JSON.stringify({ testType: 'ALL' }),
            });
            const data = await res.json();

            if (data.success) {
                const newResults = { ...results };
                Object.keys(data.results).forEach(key => {
                    if (newResults[key]) {
                        newResults[key] = {
                            ...newResults[key],
                            status: data.results[key].status,
                            message: data.results[key].message
                        };
                    }
                });
                setResults(newResults);
            }
        } catch (error) {
            console.error('Test failed', error);
        } finally {
            setLoading(false);
        }
    };

    const testLineNotification = async () => {
        setLineTesting(true);
        setResults(prev => ({
            ...prev,
            line: { ...prev.line, status: 'RUNNING', message: 'Sending...' }
        }));

        try {
            const res = await fetch('/api/system-test', {
                method: 'POST',
                body: JSON.stringify({ testType: 'LINE_TEST' }),
            });
            const data = await res.json();

            if (data.results?.line) {
                setResults(prev => ({
                    ...prev,
                    line: {
                        ...prev.line,
                        status: data.results.line.status,
                        message: data.results.line.message
                    }
                }));
            }
        } catch (error) {
            setResults(prev => ({
                ...prev,
                line: { ...prev.line, status: 'FAIL', message: 'Network Error' }
            }));
        } finally {
            setLineTesting(false);
        }
    };

    const getStatusIcon = (status: TestStatus) => {
        switch (status) {
            case 'PASS': return '✅';
            case 'FAIL': return '❌';
            case 'WARNING': return '⚠️';
            case 'RUNNING': return '⏳';
            default: return '⚪';
        }
    };

    const getStatusColor = (status: TestStatus) => {
        switch (status) {
            case 'PASS': return 'text-green-600 bg-green-50 border-green-200';
            case 'FAIL': return 'text-red-600 bg-red-50 border-red-200';
            case 'WARNING': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'RUNNING': return 'text-blue-600 bg-blue-50 border-blue-200';
            default: return 'text-gray-400 bg-gray-50 border-gray-200';
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-2 text-gray-800">🛠️ System Diagnostic Dashboard</h1>
            <p className="text-gray-500 mb-8">ตรวจสอบความพร้อมของระบบทั้งหมด (Database, AI, Payment, Notification)</p>

            <div className="flex gap-4 mb-8">
                <button
                    onClick={runSystemTests}
                    disabled={loading}
                    className={`px-6 py-3 rounded-lg font-bold text-white shadow-lg transition-all ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-xl'
                        }`}
                >
                    {loading ? 'Running Tests...' : '▶ Run Full System Test'}
                </button>
            </div>

            <div className="grid gap-4">
                {Object.values(results).map((test) => (
                    test.id !== 'line' ? (
                        <div key={test.id} className={`p-4 rounded-xl border flex items-center justify-between ${getStatusColor(test.status)}`}>
                            <div className="flex items-center gap-4">
                                <span className="text-2xl">{getStatusIcon(test.status)}</span>
                                <div>
                                    <h3 className="font-bold text-lg">{test.name}</h3>
                                    <p className="text-sm opacity-80">{test.message}</p>
                                </div>
                            </div>
                            <div className="font-mono font-bold text-sm px-3 py-1 rounded bg-white bg-opacity-50">
                                {test.status}
                            </div>
                        </div>
                    ) : (
                        <div key={test.id} className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${getStatusColor(test.status)}`}>
                            <div className="flex items-center gap-4">
                                <span className="text-2xl">{getStatusIcon(test.status)}</span>
                                <div>
                                    <h3 className="font-bold text-lg">{test.name}</h3>
                                    <p className="text-sm opacity-80">{test.message}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={testLineNotification}
                                    disabled={lineTesting}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors bg-white hover:bg-gray-50 text-gray-700`}
                                >
                                    {lineTesting ? 'Sending...' : '🔔 Send Test Alert'}
                                </button>
                                <div className="font-mono font-bold text-sm px-3 py-1 rounded bg-white bg-opacity-50">
                                    {test.status}
                                </div>
                            </div>
                        </div>
                    )
                ))}
            </div>

            <div className="mt-8 p-4 bg-gray-50 rounded-xl border text-sm text-gray-500">
                <h4 className="font-bold mb-2">Note:</h4>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Database Test: อ่านค่าจากตาราง `site_settings`</li>
                    <li>AI Test: ส่ง Prompt ง่ายๆ ไปที่ Gemini</li>
                    <li>Vector Test: ตรวจสอบ pgvector extension (ถ้ายังไม่ Enable จะ Fail)</li>
                    <li>Line Test: ต้องตั้งค่า Token ในหน้า Settings ก่อน</li>
                </ul>
            </div>
        </div>
    );
}
