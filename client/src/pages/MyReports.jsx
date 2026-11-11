
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import Navbar from '../components/Navbar';
import api from '../services/api';
import './MyReports.css';

function MyReports() {
  const [items, setItems] = useState([]);
  const [foundRequests, setFoundRequests] = useState({});
  const [myFoundRequests, setMyFoundRequests] = useState([]);
  const [requestContacts, setRequestContacts] = useState({});
  const [finderContacts, setFinderContacts] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');

  // Convert Pakistani number to WhatsApp format
  const getWhatsAppNumber = (number) => {
    let digits = number.replace(/\D/g, '');

    if (digits.startsWith('0')) {
      digits = `92${digits.slice(1)}`;
    } else if (!digits.startsWith('92')) {
      digits = `92${digits}`;
    }

    return digits;
  };

  // Fetch all reports and requests
  const fetchMyReports = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch items reported by current user
      const response = await api.get('/items/my-reports');

      const data = response.data.data;
      const myItems = Array.isArray(data)
        ? data
        : data.items || [];

      setItems(myItems);

      const requestsByItem = {};
      const ownerContactsByRequest = {};
      const finderContactsByRequest = {};

      // Find requests submitted for current user's Lost items
      const lostItems = myItems.filter(
        (item) => item.type === 'lost'
      );

      await Promise.all(
        lostItems.map(async (item) => {
          try {
            const requestResponse = await api.get(
              `/found-requests/item/${item._id}`
            );

            const requests = requestResponse.data.data;

            requestsByItem[item._id] = requests;

            // Owner fetches contacts for accepted requests
            await Promise.all(
              requests
                .filter(
                  (request) => request.status === 'accepted'
                )
                .map(async (request) => {
                  try {
                    const contactResponse = await api.get(
                      `/found-requests/${request._id}/contacts`
                    );

                    ownerContactsByRequest[request._id] =
                      contactResponse.data.data;

                  } catch (contactError) {
                    console.error(
                      'Owner contact API error:',
                      contactError.response?.data || contactError
                    );
                  }
                })
            );

          } catch (requestError) {
            console.error(
              `Unable to fetch requests for item ${item._id}:`,
              requestError.response?.data || requestError
            );

            requestsByItem[item._id] = [];
          }
        })
      );

      // Fetch requests submitted by current user as Finder
      let finderRequests = [];

      try {
        const finderResponse = await api.get(
          '/found-requests/my-requests'
        );

        finderRequests = finderResponse.data.data;

        // Finder fetches Owner contacts for accepted requests
        await Promise.all(
          finderRequests
            .filter(
              (request) => request.status === 'accepted'
            )
            .map(async (request) => {
              try {
                const contactResponse = await api.get(
                  `/found-requests/${request._id}/contacts`
                );

                finderContactsByRequest[request._id] =
                  contactResponse.data.data;

              } catch (contactError) {
                console.error(
                  'Finder contact API error:',
                  contactError.response?.data || contactError
                );
              }
            })
        );

      } catch (finderError) {
        console.error(
          'Unable to fetch your found requests:',
          finderError.response?.data || finderError
        );
      }

      setFoundRequests(requestsByItem);
      setRequestContacts(ownerContactsByRequest);
      setMyFoundRequests(finderRequests);
      setFinderContacts(finderContactsByRequest);

    } catch (error) {
      setError(
        error.response?.data?.message ||
        'Unable to load your reports.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReports();
  }, []);

  // Owner accepts or rejects a request
  const handleStatusChange = async (requestId, status) => {
    try {
      setActionLoading(requestId);
      setError('');

      await api.patch(
        `/found-requests/${requestId}/status`,
        { status }
      );

      alert(
        status === 'accepted'
          ? 'Request accepted. You can now contact the finder.'
          : 'Request rejected. Item remains active.'
      );

      await fetchMyReports();

    } catch (error) {
      setError(
        error.response?.data?.message ||
        'Unable to update request status.'
      );
    } finally {
      setActionLoading('');
    }
  };

  // Owner confirms physical receipt of Lost item
  const handleConfirmReceived = async (requestId) => {
    const confirmed = window.confirm(
      'Are you sure you have physically received your item from the finder?'
    );

    if (!confirmed) return;

    try {
      setActionLoading(requestId);
      setError('');

      await api.patch(
        `/found-requests/${requestId}/confirm-received`
      );

      alert('Item successfully marked as resolved.');

      await fetchMyReports();

    } catch (error) {
      setError(
        error.response?.data?.message ||
        'Unable to confirm item receipt.'
      );
    } finally {
      setActionLoading('');
    }
  };

  // Finder marks independent Found item as returned
  const handleMarkReturned = async (itemId) => {
    const confirmed = window.confirm(
      'Have you returned this item to its owner?'
    );

    if (!confirmed) return;

    try {
      setActionLoading(itemId);
      setError('');

      await api.patch(`/items/${itemId}/returned`);

      alert('Item successfully marked as returned.');

      await fetchMyReports();

    } catch (error) {
      setError(
        error.response?.data?.message ||
        'Unable to mark item as returned.'
      );
    } finally {
      setActionLoading('');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="report-section my-reports">
          <h1>My Reports</h1>
          <p>Loading your reports...</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="report-section my-reports">
        <h1>My Reports</h1>

        <p>
          Review your reported items and found-item requests.
        </p>

        {error && (
          <p className="error-message">{error}</p>
        )}

        {items.length === 0 && (
          <p>You have not reported any items yet.</p>
        )}

        <div className="my-report-list">

          {items.map((item) => {
            const itemRequests =
              foundRequests[item._id] || [];

            return (
              <section
                className="my-report-item"
                key={item._id}
              >
                <div className="my-report-heading">
                  <div>
                    <h2>{item.title}</h2>

                    <p>
                      {item.category} · {item.location}
                    </p>
                  </div>

                  <span
                    className={`status-pill ${
                      item.status === 'resolved'
                        ? 'status-accepted'
                        : item.status === 'returned'
                          ? 'status-returned'
                          : item.status === 'in_progress'
                            ? 'status-in-progress'
                            : item.type === 'lost'
                              ? 'status-lost'
                              : 'status-found'
                    }`}
                  >
                    {item.status === 'resolved'
                      ? 'RESOLVED'
                      : item.status === 'returned'
                        ? 'RETURNED'
                        : item.status === 'in_progress'
                          ? 'IN PROGRESS'
                          : item.type.toUpperCase()}
                  </span>
                </div>

                {item.status === 'active' && (
                  <Link to={`/items/${item._id}`}>
                    View Item
                  </Link>
                )}

                {/* Independent Found Item workflow */}
                {item.type === 'found' &&
                  item.status === 'active' && (
                    <div className="returned-actions">
                      <button
                        type="button"
                        className="accept-btn"
                        disabled={actionLoading !== ''}
                        onClick={() =>
                          handleMarkReturned(item._id)
                        }
                      >
                        {actionLoading === item._id
                          ? 'Please wait...'
                          : 'Mark as Returned'}
                      </button>
                    </div>
                  )}

                {/* Lost Item workflow - Owner */}
                {item.type === 'lost' && (
                  <div className="found-requests">
                    <h3>Found Requests</h3>

                    {itemRequests.length === 0 && (
                      <p>
                        No one has submitted a found request yet.
                      </p>
                    )}

                    {itemRequests.map((request) => {
                      const contacts =
                        requestContacts[request._id];

                      return (
                        <div
                          className="found-request-card"
                          key={request._id}
                        >
                          <p>
                            <strong>Finder:</strong>{' '}
                            {request.requestedBy?.name ||
                              'CampusFind user'}
                          </p>

                          <p>
                            <strong>Request status:</strong>{' '}
                            <span
                              className={`status-pill status-${request.status}`}
                            >
                              {request.status.toUpperCase()}
                            </span>
                          </p>

                          {request.note && (
                            <p>
                              <strong>Finder's details:</strong>{' '}
                              {request.note}
                            </p>
                          )}

                          {request.evidencePhotoUrl && (
                            <div className="request-photo">
                              <p>
                                <strong>Evidence photo:</strong>
                              </p>

                              <img
                                src={request.evidencePhotoUrl}
                                alt={`Evidence for ${item.title}`}
                              />
                            </div>
                          )}

                          {/* Owner A sees ONLY Finder B's contact */}
                          {request.status === 'accepted' && (
                            <div className="request-contacts">
                              <h3>Finder Contact Details</h3>

                              {contacts ? (
                                <div>
                                  <h4>
                                    {contacts.finder?.name || 'Finder'}
                                  </h4>

                                  {contacts.finder?.contactNumber && (
                                    <a
                                      className="primary-btn"
                                      href={`tel:${contacts.finder.contactNumber.replace(/[^\d+]/g, '')}`}
                                    >
                                      📞 Call Finder
                                    </a>
                                  )}

                                  {contacts.finder?.whatsappNumber && (
                                    <a
                                      className="primary-btn"
                                      href={`https://wa.me/${getWhatsAppNumber(contacts.finder.whatsappNumber)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      WhatsApp Finder
                                    </a>
                                  )}

                                  {!contacts.finder?.contactNumber &&
                                    !contacts.finder?.whatsappNumber && (
                                      <p>
                                        Finder has not provided contact details.
                                      </p>
                                    )}
                                </div>
                              ) : (
                                <p>
                                  Contact details unavailable. Please refresh.
                                </p>
                              )}
                            </div>
                          )}

                          {/* Accept and Reject */}
                          {request.status === 'pending' &&
                            item.status === 'active' && (
                              <div className="request-actions">
                                <button
                                  type="button"
                                  className="accept-btn"
                                  disabled={actionLoading !== ''}
                                  onClick={() =>
                                    handleStatusChange(
                                      request._id,
                                      'accepted'
                                    )
                                  }
                                >
                                  {actionLoading === request._id
                                    ? 'Please wait...'
                                    : 'Accept'}
                                </button>

                                <button
                                  type="button"
                                  className="reject-btn"
                                  disabled={actionLoading !== ''}
                                  onClick={() =>
                                    handleStatusChange(
                                      request._id,
                                      'rejected'
                                    )
                                  }
                                >
                                  Reject
                                </button>
                              </div>
                            )}

                          {/* Owner confirms physical receipt */}
                          {request.status === 'accepted' &&
                            item.status === 'in_progress' && (
                              <div className="request-actions">
                                <button
                                  type="button"
                                  className="accept-btn"
                                  disabled={actionLoading !== ''}
                                  onClick={() =>
                                    handleConfirmReceived(
                                      request._id
                                    )
                                  }
                                >
                                  {actionLoading === request._id
                                    ? 'Please wait...'
                                    : 'Confirm Received'}
                                </button>
                              </div>
                            )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}

        </div>

        {/* Finder's submitted Lost Item requests */}
        <section className="found-requests">
          <h2>My Found Requests</h2>

          {myFoundRequests.length === 0 && (
            <p>
              You have not submitted any found requests yet.
            </p>
          )}

          {myFoundRequests.map((request) => {
            const item = request.item;
            const contacts = finderContacts[request._id];

            return (
              <div
                className="found-request-card"
                key={request._id}
              >
                <h3>
                  {item?.title || 'Lost Item'}
                </h3>

                {item && (
                  <p>
                    {item.category} · {item.location}
                  </p>
                )}

                <p>
                  <strong>Request status:</strong>{' '}
                  <span
                    className={`status-pill status-${request.status}`}
                  >
                    {request.status.toUpperCase()}
                  </span>
                </p>

                {request.note && (
                  <p>
                    <strong>Your details:</strong>{' '}
                    {request.note}
                  </p>
                )}

                {request.evidencePhotoUrl && (
                  <div className="request-photo">
                    <p>
                      <strong>Your evidence photo:</strong>
                    </p>

                    <img
                      src={request.evidencePhotoUrl}
                      alt="Your submitted evidence"
                    />
                  </div>
                )}

                {/* Finder B sees ONLY Owner A's contact */}
                {request.status === 'accepted' && (
                  <div className="request-contacts">
                    <h3>Owner Contact Details</h3>

                    {contacts ? (
                      <div>
                        <h4>
                          {contacts.owner?.name || 'Item Owner'}
                        </h4>

                        {contacts.owner?.contactNumber && (
                          <a
                            className="primary-btn"
                            href={`tel:${contacts.owner.contactNumber.replace(/[^\d+]/g, '')}`}
                          >
                            📞 Call Owner
                          </a>
                        )}

                        {contacts.owner?.whatsappNumber && (
                          <a
                            className="primary-btn"
                            href={`https://wa.me/${getWhatsAppNumber(contacts.owner.whatsappNumber)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            WhatsApp Owner
                          </a>
                        )}

                        {!contacts.owner?.contactNumber &&
                          !contacts.owner?.whatsappNumber && (
                            <p>
                              Owner has not provided contact details.
                            </p>
                          )}
                      </div>
                    ) : (
                      <p>
                        Contact details unavailable. Please refresh.
                      </p>
                    )}
                  </div>
                )}

                {request.status === 'accepted' &&
                  item?.status === 'resolved' && (
                    <p>
                      The owner has confirmed receiving the item.
                    </p>
                  )}

                {request.status === 'rejected' && (
                  <p>
                    The owner rejected this request.
                  </p>
                )}
              </div>
            );
          })}
        </section>

        <Link to="/report" className="primary-btn">
          Report Another Item
        </Link>

      </main>
    </>
  );
}

export default MyReports;
