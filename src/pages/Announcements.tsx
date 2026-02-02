import { useEffect, useState } from "react";
import PageWrapper from "../components/PageWrapper";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

type Announcement = {
  id: number;
  title: string;
  content?: string;
  createdAt?: string;
};

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await api.get<{
          status: string;
          data: { announcements: Announcement[] };
        }>("/announcements");
        if (res.data.status === "success")
          setAnnouncements(res.data.data.announcements || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAnnouncements();
  }, []);

  return (
    <PageWrapper>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Duyurular</h1>
        <ul className="space-y-4">
          {announcements.map((a) => (
            <li
              key={a.id}
              className="p-4 border rounded hover:shadow cursor-pointer"
              onClick={() => navigate(`/announcements/${a.id}`)}
            >
              <h2 className="font-semibold">{a.title}</h2>
              <p className="text-sm text-gray-600">
                {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ""}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </PageWrapper>
  );
}
