
export function ContactList() {
  const contacts = [
    { id: '1', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b789?w=40&h=40&fit=crop&crop=face', name: 'Sarah' },
    { id: '2', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face', name: 'John' },
    { id: '3', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face', name: 'Emma' },
    { id: '4', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face', name: 'Mike' },
    { id: '5', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face', name: 'Alex' },
    { id: '6', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face', name: 'Lisa' },
  ];

  return (
    <div className="flex space-x-3 overflow-x-auto pb-2">
      {contacts.map((contact) => (
        <div key={contact.id} className="flex-shrink-0">
          <div className="relative">
            <img 
              src={contact.avatar} 
              alt={contact.name}
              className="w-12 h-12 rounded-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200 hover:shadow-lg"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
