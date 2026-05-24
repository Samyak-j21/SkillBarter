import { API_BASE_URL } from "../config";
import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Chat() {
  const location = useLocation();
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  // Current logged in user from localStorage
  const [me, setMe] = useState(null);
  
  // Chat list and contacts
  const [activeContact, setActiveContact] = useState(null);
  const [activeChats, setActiveChats] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  
  // Status states
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState("");
  
  // Input fields
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  // Barter Deal Creator Sidebar states
  const [isDealPanelOpen, setIsDealPanelOpen] = useState(false);
  const [dealSkillOffered, setDealSkillOffered] = useState("");
  const [dealSkillOfferedLevel, setDealSkillOfferedLevel] = useState("Easy");
  const [dealSkillWanted, setDealSkillWanted] = useState("");
  const [dealSkillWantedLevel, setDealSkillWantedLevel] = useState("Easy");
  const [dealPayer, setDealPayer] = useState("them"); // "me" or "them"
  const [dealCompensationAmount, setDealCompensationAmount] = useState("0");
  const [dealSubmitting, setDealSubmitting] = useState(false);

  const LEVEL_WEIGHTS = { Easy: 1, Medium: 2, Advanced: 3 };

  const normalizeSkills = (skillsArray) => {
    if (!skillsArray) return [];
    return skillsArray.map(item => {
      if (typeof item === 'string') return { skill: item, level: 'Easy' };
      if (item && typeof item === 'object' && item.skill) {
        return { skill: item.skill, level: item.level || 'Medium' };
      }
      return null;
    }).filter(Boolean);
  };

  // Load user session on mount
  useEffect(() => {
    const sessionData = localStorage.getItem("user");
    if (!sessionData) {
      navigate("/");
      return;
    }
    const currentUser = JSON.parse(sessionData);
    const normalizedMe = {
      ...currentUser,
      offer: normalizeSkills(currentUser.offer),
      want: normalizeSkills(currentUser.want)
    };
    setMe(normalizedMe);
    
    // Fetch active chats and potential contacts
    fetchContacts(currentUser.email);
  }, []);

  // Set initial selected contact if passed from dashboard/search
  useEffect(() => {
    if (me && location.state?.selectedUser) {
      const selected = {
        ...location.state.selectedUser,
        offer: normalizeSkills(location.state.selectedUser.offer),
        want: normalizeSkills(location.state.selectedUser.want)
      };
      setActiveContact(selected);
      // Ensure they are added to the list of active chats if they aren't already
      setActiveChats(prev => {
        if (prev.some(c => c.email.toLowerCase() === selected.email.toLowerCase())) {
          return prev;
        }
        return [selected, ...prev];
      });
      // Clear location state so refreshes don't reset selected user
      window.history.replaceState({}, document.title);
    }
  }, [me, location.state]);

  // Load and poll messages when contact changes
  useEffect(() => {
    if (!me || !activeContact) return;

    setLoadingMessages(true);
    fetchMessages();

    // Set up short polling (every 2 seconds) for fast and responsive updates
    const pollInterval = setInterval(() => {
      fetchMessages(true); // silent fetch
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [me, activeContact]);

  // Scroll to bottom on message updates
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleOfferSkillChange = (skillName) => {
    setDealSkillOffered(skillName);
    const selected = me.offer.find(s => s.skill === skillName);
    if (selected) {
      setDealSkillOfferedLevel(selected.level);
    }
  };

  const handleWantSkillChange = (skillName) => {
    setDealSkillWanted(skillName);
    const selected = activeContact.offer.find(s => s.skill === skillName);
    if (selected) {
      setDealSkillWantedLevel(selected.level);
    }
  };

  // Pre-fill deal builder options when contact changes or deal panel is opened
  useEffect(() => {
    if (!activeContact || !me) return;

    // Pick first skill me teaches
    if (me.offer && me.offer.length > 0) {
      setDealSkillOffered(me.offer[0].skill);
      setDealSkillOfferedLevel(me.offer[0].level);
    } else {
      setDealSkillOffered("");
      setDealSkillOfferedLevel("Easy");
    }

    // Pick first skill active contact teaches
    if (activeContact.offer && activeContact.offer.length > 0) {
      setDealSkillWanted(activeContact.offer[0].skill);
      setDealSkillWantedLevel(activeContact.offer[0].level);
    } else {
      setDealSkillWanted("");
      setDealSkillWantedLevel("Easy");
    }

    // Initialize custom compensation safely without overwriting thereafter
    setDealPayer("none");
    setDealCompensationAmount("0");
  }, [activeContact, isDealPanelOpen]);

  const fetchContacts = async (myEmail) => {
    setLoadingChats(true);
    try {
      // 1. Fetch active conversations
      const resActive = await fetch(`https://skillbarter-05s6.onrender.com/api/chats/active?email=${encodeURIComponent(myEmail)}`);
      const activeData = await resActive.json();

      // 2. Fetch all registered users for manual directory listing
      const resAll = await fetch(`https://skillbarter-05s6.onrender.com/api/users?exclude=${encodeURIComponent(myEmail)}`);
      const allData = await resAll.json();

      const normalizedActive = resActive.ok ? activeData.map(c => ({
        ...c,
        offer: normalizeSkills(c.offer),
        want: normalizeSkills(c.want)
      })) : [];

      const normalizedAll = resAll.ok ? allData.map(u => ({
        ...u,
        offer: normalizeSkills(u.offer),
        want: normalizeSkills(u.want)
      })) : [];

      if (resActive.ok) setActiveChats(normalizedActive);
      if (resAll.ok) setAllUsers(normalizedAll);

      // If activeContact was passed from state, ensure it is highlighted
      if (location.state?.selectedUser) {
        const selected = {
          ...location.state.selectedUser,
          offer: normalizeSkills(location.state.selectedUser.offer),
          want: normalizeSkills(location.state.selectedUser.want)
        };
        setActiveContact(selected);
      } else if (normalizedActive.length > 0 && !activeContact) {
        // Otherwise default to the first active conversation if we don't have one selected
        setActiveContact(normalizedActive[0]);
      }
    } catch (err) {
      console.error("Error fetching contacts:", err);
      setError("Failed to load chat contact lists.");
    } finally {
      setLoadingChats(false);
    }
  };

  const fetchMessages = async (isSilent = false) => {
    if (!me || !activeContact) return;
    try {
      const res = await fetch(`https://skillbarter-05s6.onrender.com/api/chats/messages?from=${encodeURIComponent(me.email)}&to=${encodeURIComponent(activeContact.email)}`);
      const data = await res.json();
      if (res.ok) {
        setMessages(data);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      if (!isSilent) setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending || !me || !activeContact) return;

    setSending(true);
    const messageText = input;
    setInput("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/chats/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: me.email,
          to: activeContact.email,
          text: messageText,
          type: "text"
        })
      });

      const newMsg = await response.json();
      if (response.ok) {
        setMessages(prev => [...prev, newMsg]);
        // Put them at the top of active chats if not already there
        setActiveChats(prev => {
          const filtered = prev.filter(c => c.email.toLowerCase() !== activeContact.email.toLowerCase());
          return [activeContact, ...filtered];
        });
      } else {
        console.error("Failed to send message:", newMsg.error);
      }
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleProposeDeal = async (e) => {
    e.preventDefault();
    if (!me || !activeContact || dealSubmitting) return;

    setDealSubmitting(true);
    
    // Signed compensation value: negative if proposer pays receiver, positive if receiver pays proposer
    const numericAmt = dealPayer === "none" ? 0 : (parseFloat(dealCompensationAmount) || 0);
    const finalCompensation = dealPayer === "me" ? -numericAmt : (dealPayer === "them" ? numericAmt : 0);

    const dealPayload = {
      from: me.email,
      to: activeContact.email,
      text: `Proposing a barter deal: ${dealSkillOffered} ⇄ ${dealSkillWanted}`,
      type: "deal",
      deal: {
        skillOffered: dealSkillOffered,
        skillOfferedLevel: dealSkillOfferedLevel,
        skillWanted: dealSkillWanted,
        skillWantedLevel: dealSkillWantedLevel,
        compensation: finalCompensation
      }
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/chats/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dealPayload)
      });

      const newMsgWithDeal = await response.json();
      if (response.ok) {
        setMessages(prev => [...prev, newMsgWithDeal]);
        setIsDealPanelOpen(false);
        // Refresh active chats
        fetchContacts(me.email);
      } else {
        alert(newMsgWithDeal.error || "Failed to propose deal");
      }
    } catch (err) {
      console.error("Error proposing deal:", err);
      alert("Something went wrong proposing the deal.");
    } finally {
      setDealSubmitting(false);
    }
  };

  const handleUpdateDealStatus = async (dealId, status) => {
    if (!me || !activeContact) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/chats/deal/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealId,
          status,
          userEmail: me.email
        })
      });

      const result = await response.json();
      if (response.ok) {
        // Fetch new messages to update system logs & deal badges
        fetchMessages();
      } else {
        alert(result.error || "Failed to update deal status.");
      }
    } catch (err) {
      console.error("Error updating deal status:", err);
    }
  };

  const getContactInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  return (
    <div className="h-screen flex flex-col theme-bg-page transition-colors duration-300 overflow-hidden">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex gap-4 md:gap-6 overflow-hidden relative">
        
        {/* SIDEBAR: Active Conversations & Contact Finder */}
        <div className={`w-full md:w-80 theme-bg-card rounded-[2.5rem] border theme-border flex flex-col overflow-hidden shadow-sm shrink-0 ${activeContact ? "hidden md:flex" : "flex"}`}>
          <div className="p-6 border-b theme-border flex flex-col gap-4">
            <h2 className="text-[10px] font-black theme-text-muted uppercase tracking-[0.2em]">Active Conversations</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {loadingChats ? (
              <div className="space-y-4">
                {[1, 2, 3].map(n => (
                  <div key={n} className="h-16 theme-bg-page rounded-2xl animate-pulse"></div>
                ))}
              </div>
            ) : (
              <>
                {/* Active Chats List */}
                <div className="space-y-2">
                  {activeChats.length > 0 ? (
                    activeChats.map(contact => (
                      <div 
                        key={contact.email}
                        onClick={() => setActiveContact(contact)}
                        className={`p-4 rounded-3xl flex items-center gap-4 cursor-pointer transition-all group ${
                          activeContact && activeContact.email.toLowerCase() === contact.email.toLowerCase()
                            ? "bg-neutral-900 dark:bg-white shadow-xl"
                            : "theme-bg-hover hover:scale-[1.02]"
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 ${
                          activeContact && activeContact.email.toLowerCase() === contact.email.toLowerCase()
                            ? "bg-blue-600 text-white"
                            : "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white"
                        }`}>
                          {getContactInitial(contact.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className={`font-black text-sm leading-tight truncate ${
                            activeContact && activeContact.email.toLowerCase() === contact.email.toLowerCase()
                              ? "text-white dark:text-neutral-900"
                              : "theme-text-primary"
                          }`}>
                            {contact.name}
                          </h3>
                          <p className={`text-[10px] uppercase tracking-widest font-black mt-1 truncate ${
                            activeContact && activeContact.email.toLowerCase() === contact.email.toLowerCase()
                              ? "text-neutral-400 dark:text-neutral-500"
                              : "theme-text-muted"
                          }`}>
                            {contact.offer && contact.offer.length > 0 
                              ? `Teaches: ${contact.offer[0].skill}`
                              : "No skills set"
                            }
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-6 text-xs theme-text-muted font-bold">No active conversations.</p>
                  )}
                </div>

                {/* Directory Finder (Start new conversation) */}
                <div className="border-t theme-border pt-6">
                  <h3 className="text-[10px] font-black theme-text-muted uppercase tracking-[0.2em] mb-4">Start a new trade</h3>
                  <div className="space-y-2">
                    {allUsers
                      .filter(u => !activeChats.some(ac => ac.email.toLowerCase() === u.email.toLowerCase()))
                      .map(user => (
                        <div 
                          key={user.email}
                          onClick={() => {
                            setActiveContact(user);
                            setActiveChats(prev => [user, ...prev]);
                          }}
                          className="p-3 theme-bg-hover hover:scale-[1.01] rounded-2xl flex items-center gap-3 cursor-pointer transition-all border theme-border border-dashed"
                        >
                          <div className="w-9 h-9 theme-bg-page rounded-xl flex items-center justify-center theme-text-muted font-black text-xs shrink-0 border theme-border">
                            {getContactInitial(user.name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold theme-text-primary text-xs leading-none">{user.name}</h4>
                            <span className="text-[8px] theme-text-muted uppercase tracking-widest font-semibold block mt-1 truncate">
                              {user.offer && user.offer.length > 0 ? `Offers ${user.offer[0].skill}` : "View profile"}
                            </span>
                          </div>
                        </div>
                    ))}
                    {allUsers.length === 0 && (
                      <p className="text-xs theme-text-muted text-center py-2">No other members registered.</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* CHAT TIMELINE AREA */}
        <div className={`flex-1 theme-bg-card rounded-[2.5rem] border theme-border flex flex-col overflow-hidden shadow-sm relative ${!activeContact ? "hidden md:flex" : "flex"}`}>
          {activeContact ? (
            <>
              {/* Header */}
              <div className="p-4 md:p-8 border-b theme-border flex justify-between items-center theme-bg-page/50 shrink-0">
                <div className="flex items-center gap-2 md:gap-4 min-w-0">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setActiveContact(null)}
                    className="md:hidden p-2 rounded-xl theme-bg-hover theme-text-primary transition-all active:scale-95 shrink-0"
                    title="Back to Chats List"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                  </button>

                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center text-white font-black text-md shrink-0 shadow-lg shadow-blue-500/10">
                    {getContactInitial(activeContact.name)}
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-black theme-text-primary text-md md:text-lg leading-tight truncate">{activeContact.name}</h2>
                    <p className="text-[9px] md:text-[10px] theme-text-muted font-bold tracking-wide mt-0.5 truncate max-w-xs md:max-w-md">
                      {activeContact.bio || "SkillBarter member ready to exchange."}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setIsDealPanelOpen(!isDealPanelOpen)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-3 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all active:scale-95 shadow-md shadow-blue-500/20 shrink-0"
                >
                  Propose Barter
                </button>
              </div>

              {/* Chat Feed */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 theme-bg-page/20">
                {loadingMessages ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs theme-text-muted font-bold uppercase tracking-widest">Loading messages...</p>
                  </div>
                ) : (
                  <>
                    {messages.length > 0 ? (
                      messages.map((msg) => {
                        // Render System Message
                        if (msg.type === "system") {
                          return (
                            <div key={msg.id} className="flex justify-center my-4">
                              <span className="bg-green-500/10 dark:bg-green-500/5 border border-green-500/20 px-5 py-2.5 rounded-full text-green-600 dark:text-green-400 text-xs font-black uppercase tracking-wider shadow-sm animate-fade-in">
                                {msg.text}
                              </span>
                            </div>
                          );
                        }

                        // Render Deal Card
                        if (msg.type === "deal" && msg.deal) {
                          const dealObj = msg.deal;
                          const isProposer = dealObj.proposer.toLowerCase() === me.email.toLowerCase();
                          
                          // Format compensation text elegantly
                          let compensationInfo = null;
                          if (dealObj.compensation > 0) {
                            compensationInfo = {
                              payerName: isProposer ? activeContact.name : me.name,
                              receiverName: isProposer ? me.name : activeContact.name,
                              amount: Math.abs(dealObj.compensation).toFixed(2),
                              mePays: !isProposer
                            };
                          } else if (dealObj.compensation < 0) {
                            compensationInfo = {
                              payerName: isProposer ? me.name : activeContact.name,
                              receiverName: isProposer ? activeContact.name : me.name,
                              amount: Math.abs(dealObj.compensation).toFixed(2),
                              mePays: isProposer
                            };
                          }

                          return (
                            <div key={msg.id} className={`flex ${isProposer ? "justify-end" : "justify-start"} my-6`}>
                              <div className="max-w-[85%] md:max-w-[65%] w-full">
                                <div className="rounded-[2rem] border theme-border theme-bg-card overflow-hidden shadow-xl shadow-neutral-100/30 dark:shadow-none animate-scale-up">
                                  {/* Deal Header */}
                                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between text-white">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Proposed Barter Deal</span>
                                    <span className="text-[8px] font-black uppercase bg-white/20 px-2 py-0.5 rounded-md">
                                      Level-based
                                    </span>
                                  </div>
                                  
                                  {/* Deal Body */}
                                  <div className="p-6 space-y-5">
                                    {/* Skills Exchange Matrix */}
                                    <div className="grid grid-cols-2 gap-4 relative">
                                      <div className="theme-bg-page p-4 rounded-2xl border theme-border">
                                        <span className="text-[8px] font-black theme-text-muted uppercase tracking-widest block mb-1">Teaches</span>
                                        <h4 className="font-black theme-text-primary text-sm truncate">{dealObj.skillOffered}</h4>
                                        <span className="inline-block mt-2 px-2 py-0.5 rounded-md text-[8px] font-black uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                          {dealObj.skillOfferedLevel}
                                        </span>
                                      </div>
                                      <div className="theme-bg-page p-4 rounded-2xl border theme-border">
                                        <span className="text-[8px] font-black theme-text-muted uppercase tracking-widest block mb-1">Learns</span>
                                        <h4 className="font-black theme-text-primary text-sm truncate">{dealObj.skillWanted}</h4>
                                        <span className="inline-block mt-2 px-2 py-0.5 rounded-md text-[8px] font-black uppercase bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                                          {dealObj.skillWantedLevel}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Financial Adjustment */}
                                    <div className="border-t theme-border pt-4">
                                      <span className="text-[8px] font-black theme-text-muted uppercase tracking-widest block mb-1">Cash Compensation</span>
                                      {compensationInfo ? (
                                        <div className="flex items-center justify-between">
                                          <p className="text-xs font-semibold theme-text-secondary leading-relaxed">
                                            {compensationInfo.payerName} pays {compensationInfo.receiverName}
                                          </p>
                                          <span className={`text-md font-black ${
                                            compensationInfo.mePays ? "text-amber-500" : "text-green-500"
                                          }`}>
                                            {compensationInfo.mePays ? "-" : "+"}₹{compensationInfo.amount}
                                          </span>
                                        </div>
                                      ) : (
                                        <p className="text-xs font-bold text-blue-500">Balanced exchange (No cash adjustment)</p>
                                      )}
                                    </div>

                                    {/* Action Box or Status Badge */}
                                    <div className="border-t theme-border pt-4">
                                      {dealObj.status === "pending" ? (
                                        !isProposer ? (
                                          <div className="flex gap-3">
                                            <button
                                              onClick={() => handleUpdateDealStatus(dealObj.id, "accepted")}
                                              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-[0.98]"
                                            >
                                              Accept
                                            </button>
                                            <button
                                              onClick={() => handleUpdateDealStatus(dealObj.id, "declined")}
                                              className="flex-1 border border-red-500/30 hover:border-red-500 text-red-500 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-[0.98]"
                                            >
                                              Decline
                                            </button>
                                          </div>
                                        ) : (
                                          <div className="flex items-center justify-center gap-2 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-600 text-[10px] font-black uppercase tracking-widest animate-pulse">
                                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span>
                                            Waiting for response
                                          </div>
                                        )
                                      ) : dealObj.status === "accepted" ? (
                                        <div className="flex items-center justify-center gap-2 py-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-600 dark:text-green-400 text-xs font-black uppercase tracking-wider">
                                          Barter Accepted & Confirmed
                                        </div>
                                      ) : (
                                        <div className="flex items-center justify-center gap-2 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 text-xs font-black uppercase tracking-wider">
                                          Deal Declined
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        // Render Standard Text Message
                        const isMe = msg.from.toLowerCase() === me.email.toLowerCase();
                        return (
                          <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} animate-fade-in`}>
                            <div className={`max-w-[70%] ${isMe ? "order-2" : ""}`}>
                              <div className={`px-6 py-4 rounded-[1.5rem] ${
                                isMe 
                                  ? "bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-500/10" 
                                  : "theme-bg-page theme-text-primary rounded-tl-none border theme-border shadow-sm"
                              }`}>
                                <p className="text-sm font-medium leading-relaxed break-words">{msg.text}</p>
                              </div>
                              <span className={`text-[8px] uppercase tracking-[0.2em] font-black theme-text-muted mt-2 block ${
                                isMe ? "text-right" : "text-left"
                              }`}>
                                {msg.timestamp}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <div className="w-16 h-16 theme-bg-card border theme-border rounded-full flex items-center justify-center text-sm font-black mb-4">
                          HI
                        </div>
                        <h3 className="text-lg font-black theme-text-primary">Say Hello!</h3>
                        <p className="theme-text-secondary text-xs max-w-xs mt-2 font-semibold leading-relaxed">
                          Start chatting with {activeContact.name} to arrange a skills exchange, adjust details, and finalize a trade deal.
                        </p>
                      </div>
                    )}
                    <div ref={scrollRef}></div>
                  </>
                )}
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="p-6 md:p-8 theme-bg-page/50 border-t theme-border shrink-0">
                <div className="relative flex items-center gap-4">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    placeholder={`Write a message to ${activeContact.name}...`}
                    disabled={sending}
                    className="flex-1 theme-bg-card border theme-border theme-text-primary rounded-2xl px-6 py-4 outline-none focus:border-blue-600 transition-all font-semibold placeholder:text-neutral-300 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || sending}
                    className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-6 md:px-8 h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-20 hover:bg-blue-600 dark:hover:bg-neutral-200 shrink-0"
                  >
                    {sending ? "Sending" : "Send"}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-20 h-20 theme-bg-card border theme-border rounded-full flex items-center justify-center text-xs font-black mb-6">
                CHAT
              </div>
              <h2 className="text-2xl font-black theme-text-primary">Skills Barter Inbox</h2>
              <p className="theme-text-secondary text-sm max-w-sm mt-3 font-semibold leading-relaxed">
                Connect and arrange mutual trade proposals with matching developers, creatives, and experts. Pick a conversation from the sidebar or click "Explore" in the navbar.
              </p>
            </div>
          )}

          {/* BARTER DEAL DRAWER / SIDE PANEL */}
          {activeContact && isDealPanelOpen && (
            <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm z-30 flex justify-end animate-fade-in">
              <div 
                className="w-full max-w-md theme-bg-card h-full border-l theme-border shadow-2xl flex flex-col justify-between overflow-y-auto animate-slide-in"
              >
                {/* Drawer Header */}
                <div className="p-8 border-b theme-border flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white shrink-0">
                  <div>
                    <h3 className="font-black text-lg uppercase tracking-wider">Propose Barter Deal</h3>
                    <p className="text-[10px] text-white/70 font-semibold uppercase tracking-widest mt-1">
                      Exchange trade with {activeContact.name}
                    </p>
                  </div>
                  <button 
                    onClick={() => setIsDealPanelOpen(false)}
                    className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center font-bold text-lg"
                  >
                    ✕
                  </button>
                </div>

                {/* Drawer Body / Form */}
                <form onSubmit={handleProposeDeal} className="flex-1 p-8 space-y-6">
                  {/* Skill Offered Section */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black theme-text-muted uppercase tracking-widest ml-1">
                      You Offer to Teach
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <select 
                        value={dealSkillOffered}
                        onChange={(e) => handleOfferSkillChange(e.target.value)}
                        className="flex-1 theme-bg-page border theme-border theme-text-primary px-4 py-3.5 rounded-2xl outline-none focus:border-blue-600 font-bold"
                        required
                      >
                        <option value="" disabled>Select a skill you teach...</option>
                        {me.offer && me.offer.map(item => (
                          <option key={item.skill} value={item.skill}>
                            {item.skill} ({item.category || "Skill"})
                          </option>
                        ))}
                        {(!me.offer || me.offer.length === 0) && (
                          <option value="" disabled>Go to Profile to add teaching skills!</option>
                        )}
                      </select>
                      
                      <span className="w-full sm:w-36 theme-bg-page border theme-border theme-text-secondary px-4 py-3.5 rounded-2xl font-black flex items-center justify-center text-[10px] uppercase tracking-widest">
                        {dealSkillOfferedLevel}
                      </span>
                    </div>
                  </div>

                  {/* Skill Wanted Section */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black theme-text-muted uppercase tracking-widest ml-1">
                      They Offer in Return
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <select 
                        value={dealSkillWanted}
                        onChange={(e) => handleWantSkillChange(e.target.value)}
                        className="flex-1 theme-bg-page border theme-border theme-text-primary px-4 py-3.5 rounded-2xl outline-none focus:border-blue-600 font-bold"
                        required
                      >
                        <option value="" disabled>Select a skill they teach...</option>
                        {activeContact.offer && activeContact.offer.map(item => (
                          <option key={item.skill} value={item.skill}>
                            {item.skill} ({item.category || "Skill"})
                          </option>
                        ))}
                        {(!activeContact.offer || activeContact.offer.length === 0) && (
                          <option value="" disabled>This user hasn't added teaching skills yet.</option>
                        )}
                      </select>
                      
                      <span className="w-full sm:w-36 theme-bg-page border theme-border theme-text-secondary px-4 py-3.5 rounded-2xl font-black flex items-center justify-center text-[10px] uppercase tracking-widest">
                        {dealSkillWantedLevel}
                      </span>
                    </div>
                  </div>

                  {/* Cash Custom Adjustment */}
                  <div className="space-y-4 pt-4 border-t theme-border">
                    <label className="text-[10px] font-black theme-text-muted uppercase tracking-widest ml-1">
                      Cash Adjustment / Compensation
                    </label>
                    
                    <div className="flex flex-col gap-3">
                      <select 
                        value={dealPayer}
                        onChange={(e) => setDealPayer(e.target.value)}
                        className="w-full theme-bg-page border theme-border theme-text-primary px-4 py-4 rounded-2xl outline-none focus:border-blue-600 font-bold"
                      >
                        <option value="none">Balanced exchange (No Cash Adjustment)</option>
                        <option value="them">Propose adjustment: they pay you</option>
                        <option value="me">Propose adjustment: you pay them</option>
                      </select>
                      
                      {dealPayer !== "none" && (
                        <div className="relative animate-scale-up">
                          <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold theme-text-primary">₹</span>
                          <input 
                            type="number"
                            min="0"
                            step="1"
                            value={dealCompensationAmount === "0" ? "" : dealCompensationAmount}
                            onChange={(e) => setDealCompensationAmount(e.target.value)}
                            placeholder="Enter amount (e.g. 500)"
                            required
                            className="w-full theme-bg-page border theme-border theme-text-primary pl-10 pr-6 py-4 rounded-2xl outline-none focus:border-blue-600 font-bold placeholder:text-neutral-300"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={dealSubmitting || !dealSkillOffered || !dealSkillWanted}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-blue-500/20 mt-4 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {dealSubmitting ? "Proposing Trade..." : "Propose Barter Deal"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}