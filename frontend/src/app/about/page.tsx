import { Shield, Brain, Microscope, CheckCircle } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-16">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-slate-900 sm:text-5xl">Our Artificial Intelligence</h1>
                    <p className="mt-4 text-xl text-slate-600 max-w-2xl mx-auto">
                        DermAI uses state-of-the-art Deep Learning to assist in identifying over 20 different skin conditions with remarkable accuracy.
                    </p>
                </div>

                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-800 mb-6">How The Model Works</h2>
                            <p className="text-slate-600 mb-4 leading-relaxed">
                                Our core engine is built on <strong className="text-slate-900">MobileNetV2</strong>, a highly efficient Convolutional Neural Network (CNN) architecture. By using transfer learning, we fine-tuned this model on a dataset of thousands of dermatoscopic images.
                            </p>
                            <p className="text-slate-600 leading-relaxed">
                                When you upload an image, the model extracts deep visual features—such as texture, color variations, and border irregularities—and maps them to known patterns of skin diseases like Melanoma, Basal Cell Carcinoma, and benign Nevus.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-6 rounded-2xl flex flex-col items-center text-center">
                                <Brain className="w-10 h-10 text-[#0284c7] mb-3" />
                                <h3 className="font-bold text-slate-900">Deep Learning</h3>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-2xl flex flex-col items-center text-center">
                                <Microscope className="w-10 h-10 text-teal-600 mb-3" />
                                <h3 className="font-bold text-slate-900">Clinical Focus</h3>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-2xl flex flex-col items-center text-center">
                                <Shield className="w-10 h-10 text-slate-800 mb-3" />
                                <h3 className="font-bold text-slate-900">Secure Privacy</h3>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-2xl flex flex-col items-center text-center">
                                <CheckCircle className="w-10 h-10 text-green-500 mb-3" />
                                <h3 className="font-bold text-slate-900">98%+ Accuracy</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
